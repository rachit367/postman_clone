from sqlalchemy.orm import Session

from app.repositories import environment as repo
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentOut,
    EnvironmentUpdate,
    RevealOut,
)


def list_environments(db: Session) -> list[EnvironmentOut]:
    return [EnvironmentOut.model_validate(item) for item in repo.list_environments(db)]


def get_environment(db: Session, environment_id: int) -> EnvironmentOut:
    return EnvironmentOut.model_validate(repo.get_environment(db, environment_id))


def create_environment(db: Session, data: EnvironmentCreate) -> EnvironmentOut:
    return EnvironmentOut.model_validate(repo.create_environment(db, data))


def update_environment(db: Session, environment_id: int, data: EnvironmentUpdate) -> EnvironmentOut:
    return EnvironmentOut.model_validate(repo.update_environment(db, environment_id, data))


def delete_environment(db: Session, environment_id: int) -> None:
    repo.delete_environment(db, environment_id)


def activate_environment(db: Session, environment_id: int) -> EnvironmentOut:
    return EnvironmentOut.model_validate(repo.activate_environment(db, environment_id))


def reveal_variable(db: Session, variable_id: int) -> RevealOut:
    return RevealOut(value=repo.reveal_variable(db, variable_id))
