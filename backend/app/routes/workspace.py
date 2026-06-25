from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers import workspace as controller
from app.schemas.workspace import WorkspaceCreate, WorkspaceOut, WorkspaceUpdate

router = APIRouter(tags=["workspaces"])


@router.get("/workspaces", response_model=list[WorkspaceOut])
def list_workspaces(db: Session = Depends(get_db)):
    return controller.list_workspaces(db)


@router.post("/workspaces", response_model=WorkspaceOut, status_code=status.HTTP_201_CREATED)
def create_workspace(data: WorkspaceCreate, db: Session = Depends(get_db)):
    return controller.create_workspace(db, data)


@router.patch("/workspaces/{workspace_id}", response_model=WorkspaceOut)
def update_workspace(workspace_id: int, data: WorkspaceUpdate, db: Session = Depends(get_db)):
    return controller.update_workspace(db, workspace_id, data)


@router.delete("/workspaces/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(workspace_id: int, db: Session = Depends(get_db)):
    controller.delete_workspace(db, workspace_id)
