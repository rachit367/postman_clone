from sqlalchemy.orm import Session

from app.repositories import history as repo
from app.schemas.history import HistoryOut


def list_history(db: Session) -> list[HistoryOut]:
    return [HistoryOut.model_validate(item) for item in repo.list_history(db)]


def delete_history(db: Session, history_id: int) -> None:
    repo.delete_history(db, history_id)


def clear_history(db: Session) -> None:
    repo.clear_history(db)
