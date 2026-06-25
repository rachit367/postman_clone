from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers import run as controller
from app.schemas.run import RunRequest

router = APIRouter(tags=["run"])


@router.post("/run")
def run_request(payload: RunRequest, db: Session = Depends(get_db)):
    return controller.run_request(db, payload)
