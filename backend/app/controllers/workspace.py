from sqlalchemy.orm import Session

from app.repositories import workspace as repo
from app.schemas.workspace import WorkspaceCreate, WorkspaceOut, WorkspaceUpdate


def list_workspaces(db: Session) -> list[WorkspaceOut]:
    return [WorkspaceOut.model_validate(item) for item in repo.list_workspaces(db)]


def create_workspace(db: Session, data: WorkspaceCreate) -> WorkspaceOut:
    return WorkspaceOut.model_validate(repo.create_workspace(db, data))


def update_workspace(db: Session, workspace_id: int, data: WorkspaceUpdate) -> WorkspaceOut:
    return WorkspaceOut.model_validate(repo.update_workspace(db, workspace_id, data))


def delete_workspace(db: Session, workspace_id: int) -> None:
    repo.delete_workspace(db, workspace_id)
