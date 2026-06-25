from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.folder import FolderOut
from app.schemas.request import RequestOut


class CollectionCreate(BaseModel):
    name: str
    description: str | None = None


class CollectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CollectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime
    folders: list[FolderOut] = []
    requests: list[RequestOut] = []
