from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import History
from app.utils.errors import NotFoundError


def list_history(db: Session, workspace_id: int) -> list[History]:
    stmt = (
        select(History)
        .where(History.workspace_id == workspace_id)
        .order_by(History.created_at.desc(), History.id.desc())
    )
    return list(db.execute(stmt).scalars().all())


def create_history(
    db: Session,
    workspace_id: int,
    method: str,
    url: str,
    request_snapshot: dict,
    status_code: int | None,
    response_time_ms: int | None,
    response_size_bytes: int | None,
    response_snapshot: dict,
) -> History:
    entry = History(
        workspace_id=workspace_id,
        method=method,
        url=url,
        request_snapshot=request_snapshot,
        status_code=status_code,
        response_time_ms=response_time_ms,
        response_size_bytes=response_size_bytes,
        response_snapshot=response_snapshot,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_history(db: Session, history_id: int) -> None:
    entry = db.get(History, history_id)
    if entry is None:
        raise NotFoundError("History entry")
    db.delete(entry)
    db.commit()


def clear_history(db: Session) -> None:
    db.execute(delete(History))
    db.commit()
