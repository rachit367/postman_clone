from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers import collection as controller
from app.schemas.collection import CollectionCreate, CollectionOut, CollectionUpdate
from app.schemas.folder import FolderCreate, FolderOut, FolderUpdate

router = APIRouter(tags=["collections"])


@router.get("/collections", response_model=list[CollectionOut])
def list_collections(db: Session = Depends(get_db)):
    return controller.list_collections(db)


@router.post("/collections", response_model=CollectionOut, status_code=status.HTTP_201_CREATED)
def create_collection(data: CollectionCreate, db: Session = Depends(get_db)):
    return controller.create_collection(db, data)


@router.get("/collections/{collection_id}", response_model=CollectionOut)
def get_collection(collection_id: int, db: Session = Depends(get_db)):
    return controller.get_collection(db, collection_id)


@router.patch("/collections/{collection_id}", response_model=CollectionOut)
def update_collection(collection_id: int, data: CollectionUpdate, db: Session = Depends(get_db)):
    return controller.update_collection(db, collection_id, data)


@router.delete("/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(collection_id: int, db: Session = Depends(get_db)):
    controller.delete_collection(db, collection_id)


@router.post(
    "/collections/{collection_id}/folders",
    response_model=FolderOut,
    status_code=status.HTTP_201_CREATED,
)
def create_folder(collection_id: int, data: FolderCreate, db: Session = Depends(get_db)):
    return controller.create_folder(db, collection_id, data)


@router.patch("/folders/{folder_id}", response_model=FolderOut)
def update_folder(folder_id: int, data: FolderUpdate, db: Session = Depends(get_db)):
    return controller.update_folder(db, folder_id, data)


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(folder_id: int, db: Session = Depends(get_db)):
    controller.delete_folder(db, folder_id)
