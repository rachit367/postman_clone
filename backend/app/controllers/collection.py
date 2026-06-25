from sqlalchemy.orm import Session

from app.models import Collection
from app.repositories import collection as repo
from app.schemas.collection import CollectionCreate, CollectionOut, CollectionUpdate
from app.schemas.folder import FolderCreate, FolderOut, FolderUpdate


def _to_out(collection: Collection) -> CollectionOut:
    out = CollectionOut.model_validate(collection)
    out.requests = [item for item in out.requests if item.folder_id is None]
    return out


def list_collections(db: Session) -> list[CollectionOut]:
    return [_to_out(item) for item in repo.list_collections(db)]


def get_collection(db: Session, collection_id: int) -> CollectionOut:
    return _to_out(repo.get_collection(db, collection_id))


def create_collection(db: Session, data: CollectionCreate) -> CollectionOut:
    return _to_out(repo.create_collection(db, data))


def update_collection(db: Session, collection_id: int, data: CollectionUpdate) -> CollectionOut:
    return _to_out(repo.update_collection(db, collection_id, data))


def delete_collection(db: Session, collection_id: int) -> None:
    repo.delete_collection(db, collection_id)


def create_folder(db: Session, collection_id: int, data: FolderCreate) -> FolderOut:
    return FolderOut.model_validate(repo.create_folder(db, collection_id, data))


def update_folder(db: Session, folder_id: int, data: FolderUpdate) -> FolderOut:
    return FolderOut.model_validate(repo.update_folder(db, folder_id, data))


def delete_folder(db: Session, folder_id: int) -> None:
    repo.delete_folder(db, folder_id)
