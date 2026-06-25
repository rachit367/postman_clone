from sqlalchemy.orm import Session

from app.repositories import request as repo
from app.schemas.request import RequestCreate, RequestOut, RequestUpdate


def create_request(db: Session, collection_id: int, data: RequestCreate) -> RequestOut:
    return RequestOut.model_validate(repo.create_request(db, collection_id, data))


def get_request(db: Session, request_id: int) -> RequestOut:
    return RequestOut.model_validate(repo.get_request(db, request_id))


def update_request(db: Session, request_id: int, data: RequestUpdate) -> RequestOut:
    return RequestOut.model_validate(repo.update_request(db, request_id, data))


def delete_request(db: Session, request_id: int) -> None:
    repo.delete_request(db, request_id)


def reveal_auth(db: Session, request_id: int) -> dict:
    return repo.reveal_auth(db, request_id)
