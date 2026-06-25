from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate
from app.utils.errors import AppError, NotFoundError


def list_workspaces(db: Session) -> list[Workspace]:
    stmt = select(Workspace).order_by(Workspace.id)
    return list(db.execute(stmt).scalars().all())


def get_workspace(db: Session, workspace_id: int) -> Workspace:
    workspace = db.get(Workspace, workspace_id)
    if workspace is None:
        raise NotFoundError("Workspace")
    return workspace


def create_workspace(db: Session, data: WorkspaceCreate) -> Workspace:
    workspace = Workspace(name=data.name)
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace


def update_workspace(db: Session, workspace_id: int, data: WorkspaceUpdate) -> Workspace:
    workspace = get_workspace(db, workspace_id)
    workspace.name = data.name
    db.commit()
    db.refresh(workspace)
    return workspace


def delete_workspace(db: Session, workspace_id: int) -> None:
    workspace = get_workspace(db, workspace_id)
    if db.query(Workspace).count() <= 1:
        raise AppError(400, "last_workspace", "Cannot delete the only workspace")
    db.delete(workspace)
    db.commit()
