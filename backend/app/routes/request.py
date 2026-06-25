from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers import request as controller
from app.schemas.request import RequestCreate, RequestOut, RequestUpdate

router = APIRouter(tags=["requests"])


@router.post(
    "/collections/{collection_id}/requests",
    response_model=RequestOut,
    status_code=status.HTTP_201_CREATED,
)
def create_request(collection_id: int, data: RequestCreate, db: Session = Depends(get_db)):
    return controller.create_request(db, collection_id, data)


@router.get("/requests/{request_id}", response_model=RequestOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    return controller.get_request(db, request_id)


@router.patch("/requests/{request_id}", response_model=RequestOut)
def update_request(request_id: int, data: RequestUpdate, db: Session = Depends(get_db)):
    return controller.update_request(db, request_id, data)


@router.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(request_id: int, db: Session = Depends(get_db)):
    controller.delete_request(db, request_id)


@router.get("/requests/{request_id}/auth/reveal")
def reveal_auth(request_id: int, db: Session = Depends(get_db)):
    return controller.reveal_auth(db, request_id)
