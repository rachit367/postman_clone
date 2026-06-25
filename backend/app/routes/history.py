from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers import history as controller
from app.schemas.history import HistoryOut

router = APIRouter(tags=["history"])


@router.get("/history", response_model=list[HistoryOut])
def list_history(workspace_id: int, db: Session = Depends(get_db)):
    return controller.list_history(db, workspace_id)


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
def clear_history(db: Session = Depends(get_db)):
    controller.clear_history(db)


@router.delete("/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(history_id: int, db: Session = Depends(get_db)):
    controller.delete_history(db, history_id)
