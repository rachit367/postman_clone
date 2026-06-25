from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Collection, Folder
from app.schemas.collection import CollectionCreate, CollectionUpdate
from app.schemas.folder import FolderCreate, FolderUpdate
from app.utils.errors import NotFoundError


def _with_relations():
    return (
        selectinload(Collection.folders).selectinload(Folder.requests),
        selectinload(Collection.requests),
    )


def list_collections(db: Session, workspace_id: int) -> list[Collection]:
    stmt = (
        select(Collection)
        .options(*_with_relations())
        .where(Collection.workspace_id == workspace_id)
        .order_by(Collection.id)
    )
    return list(db.execute(stmt).scalars().all())


def get_collection(db: Session, collection_id: int) -> Collection:
    stmt = (
        select(Collection)
        .options(*_with_relations())
        .where(Collection.id == collection_id)
    )
    collection = db.execute(stmt).scalars().first()
    if collection is None:
        raise NotFoundError("Collection")
    return collection


def create_collection(db: Session, data: CollectionCreate) -> Collection:
    collection = Collection(
        workspace_id=data.workspace_id, name=data.name, description=data.description
    )
    db.add(collection)
    db.commit()
    return get_collection(db, collection.id)


def update_collection(db: Session, collection_id: int, data: CollectionUpdate) -> Collection:
    collection = get_collection(db, collection_id)
    if data.name is not None:
        collection.name = data.name
    if data.description is not None:
        collection.description = data.description
    db.commit()
    return get_collection(db, collection_id)


def delete_collection(db: Session, collection_id: int) -> None:
    collection = get_collection(db, collection_id)
    db.delete(collection)
    db.commit()


def create_folder(db: Session, collection_id: int, data: FolderCreate) -> Folder:
    get_collection(db, collection_id)
    folder = Folder(collection_id=collection_id, name=data.name)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


def update_folder(db: Session, folder_id: int, data: FolderUpdate) -> Folder:
    folder = db.get(Folder, folder_id)
    if folder is None:
        raise NotFoundError("Folder")
    folder.name = data.name
    db.commit()
    db.refresh(folder)
    return folder


def delete_folder(db: Session, folder_id: int) -> None:
    folder = db.get(Folder, folder_id)
    if folder is None:
        raise NotFoundError("Folder")
    db.delete(folder)
    db.commit()
