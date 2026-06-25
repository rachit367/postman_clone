from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers import environment as controller
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentOut,
    EnvironmentUpdate,
    RevealOut,
)

router = APIRouter(tags=["environments"])


@router.get("/environments", response_model=list[EnvironmentOut])
def list_environments(db: Session = Depends(get_db)):
    return controller.list_environments(db)


@router.post("/environments", response_model=EnvironmentOut, status_code=status.HTTP_201_CREATED)
def create_environment(data: EnvironmentCreate, db: Session = Depends(get_db)):
    return controller.create_environment(db, data)


@router.get("/environments/{environment_id}", response_model=EnvironmentOut)
def get_environment(environment_id: int, db: Session = Depends(get_db)):
    return controller.get_environment(db, environment_id)


@router.patch("/environments/{environment_id}", response_model=EnvironmentOut)
def update_environment(environment_id: int, data: EnvironmentUpdate, db: Session = Depends(get_db)):
    return controller.update_environment(db, environment_id, data)


@router.delete("/environments/{environment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_environment(environment_id: int, db: Session = Depends(get_db)):
    controller.delete_environment(db, environment_id)


@router.post("/environments/{environment_id}/activate", response_model=EnvironmentOut)
def activate_environment(environment_id: int, db: Session = Depends(get_db)):
    return controller.activate_environment(db, environment_id)


@router.get("/variables/{variable_id}/reveal", response_model=RevealOut)
def reveal_variable(variable_id: int, db: Session = Depends(get_db)):
    return controller.reveal_variable(db, variable_id)
