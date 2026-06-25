from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.models import Environment, EnvironmentVariable
from app.schemas.environment import EnvironmentCreate, EnvironmentUpdate, VariableIn
from app.services import crypto
from app.utils.errors import NotFoundError

MASK = "••••••"


def _store_value(variable: VariableIn) -> str:
    if variable.is_secret and variable.value:
        return crypto.encrypt(variable.value)
    return variable.value


def _mask(variable: EnvironmentVariable) -> dict:
    return {
        "id": variable.id,
        "key": variable.key,
        "value": MASK if (variable.is_secret and variable.value) else variable.value,
        "is_secret": variable.is_secret,
        "enabled": variable.enabled,
    }


def _to_dict(environment: Environment) -> dict:
    return {
        "id": environment.id,
        "name": environment.name,
        "is_active": environment.is_active,
        "created_at": environment.created_at,
        "updated_at": environment.updated_at,
        "variables": [_mask(item) for item in environment.variables],
    }


def _load(db: Session, environment_id: int) -> Environment:
    stmt = (
        select(Environment)
        .options(selectinload(Environment.variables))
        .where(Environment.id == environment_id)
    )
    environment = db.execute(stmt).scalars().first()
    if environment is None:
        raise NotFoundError("Environment")
    return environment


def list_environments(db: Session) -> list[dict]:
    stmt = (
        select(Environment)
        .options(selectinload(Environment.variables))
        .order_by(Environment.id)
    )
    return [_to_dict(item) for item in db.execute(stmt).scalars().all()]


def get_environment(db: Session, environment_id: int) -> dict:
    return _to_dict(_load(db, environment_id))


def create_environment(db: Session, data: EnvironmentCreate) -> dict:
    environment = Environment(name=data.name)
    for variable in data.variables:
        environment.variables.append(
            EnvironmentVariable(
                key=variable.key,
                value=_store_value(variable),
                is_secret=variable.is_secret,
                enabled=variable.enabled,
            )
        )
    db.add(environment)
    db.commit()
    return get_environment(db, environment.id)


def update_environment(db: Session, environment_id: int, data: EnvironmentUpdate) -> dict:
    environment = _load(db, environment_id)
    if data.name is not None:
        environment.name = data.name
    if data.variables is not None:
        environment.variables.clear()
        db.flush()
        for variable in data.variables:
            environment.variables.append(
                EnvironmentVariable(
                    key=variable.key,
                    value=_store_value(variable),
                    is_secret=variable.is_secret,
                    enabled=variable.enabled,
                )
            )
    db.commit()
    return get_environment(db, environment_id)


def delete_environment(db: Session, environment_id: int) -> None:
    environment = _load(db, environment_id)
    db.delete(environment)
    db.commit()


def activate_environment(db: Session, environment_id: int) -> dict:
    _load(db, environment_id)
    db.execute(update(Environment).values(is_active=False))
    db.execute(
        update(Environment).where(Environment.id == environment_id).values(is_active=True)
    )
    db.commit()
    return get_environment(db, environment_id)


def deactivate_environments(db: Session) -> None:
    db.execute(update(Environment).values(is_active=False))
    db.commit()


def reveal_variable(db: Session, variable_id: int) -> str:
    variable = db.get(EnvironmentVariable, variable_id)
    if variable is None:
        raise NotFoundError("Variable")
    if variable.is_secret and variable.value and crypto.is_encrypted(variable.value):
        return crypto.decrypt(variable.value)
    return variable.value


def active_variables(db: Session, environment_id: int | None) -> dict:
    if environment_id is None:
        stmt = (
            select(Environment)
            .options(selectinload(Environment.variables))
            .where(Environment.is_active.is_(True))
        )
        environment = db.execute(stmt).scalars().first()
    else:
        environment = _load(db, environment_id)
    if environment is None:
        return {}
    resolved = {}
    for variable in environment.variables:
        if not variable.enabled:
            continue
        value = variable.value
        if variable.is_secret and value and crypto.is_encrypted(value):
            value = crypto.decrypt(value)
        resolved[variable.key] = value
    return resolved
