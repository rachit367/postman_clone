from sqlalchemy.orm import Session

from app.models import Request
from app.repositories.collection import get_collection
from app.schemas.request import RequestCreate, RequestUpdate
from app.services import crypto
from app.utils.errors import NotFoundError

MASK = "••••••"

_SECRET_FIELDS = {
    "bearer": ["token"],
    "basic": ["password"],
}


def _secret_fields(auth_type: str) -> list[str]:
    return _SECRET_FIELDS.get(auth_type, [])


def _encrypt_auth(auth_type: str, auth_data: dict) -> dict:
    stored = dict(auth_data)
    for field in _secret_fields(auth_type):
        raw = stored.get(field)
        if raw:
            stored[field] = crypto.encrypt(str(raw))
    return stored


def _mask_auth(auth_type: str, auth_data: dict) -> dict:
    masked = dict(auth_data)
    for field in _secret_fields(auth_type):
        if masked.get(field):
            masked[field] = MASK
    return masked


def _model_to_dict(request: Request) -> dict:
    data = {
        column.name: getattr(request, column.name)
        for column in Request.__table__.columns
    }
    data["auth_data"] = _mask_auth(request.auth_type, request.auth_data or {})
    return data


def _get(db: Session, request_id: int) -> Request:
    request = db.get(Request, request_id)
    if request is None:
        raise NotFoundError("Request")
    return request


def get_request(db: Session, request_id: int) -> dict:
    return _model_to_dict(_get(db, request_id))


def create_request(db: Session, collection_id: int, data: RequestCreate) -> dict:
    get_collection(db, collection_id)
    payload = data.model_dump()
    payload["auth_data"] = _encrypt_auth(data.auth_type, data.auth_data)
    request = Request(collection_id=collection_id, **payload)
    db.add(request)
    db.commit()
    db.refresh(request)
    return _model_to_dict(request)


def update_request(db: Session, request_id: int, data: RequestUpdate) -> dict:
    request = _get(db, request_id)
    updates = data.model_dump(exclude_unset=True)
    new_auth_type = updates.get("auth_type", request.auth_type)
    if "auth_data" in updates:
        updates["auth_data"] = _encrypt_auth(new_auth_type, updates["auth_data"])
    for key, value in updates.items():
        setattr(request, key, value)
    db.commit()
    db.refresh(request)
    return _model_to_dict(request)


def delete_request(db: Session, request_id: int) -> None:
    request = _get(db, request_id)
    db.delete(request)
    db.commit()


def reveal_auth(db: Session, request_id: int) -> dict:
    request = _get(db, request_id)
    revealed = dict(request.auth_data or {})
    for field in _secret_fields(request.auth_type):
        value = revealed.get(field)
        if value:
            revealed[field] = crypto.decrypt(value) if crypto.is_encrypted(value) else value
    return revealed
