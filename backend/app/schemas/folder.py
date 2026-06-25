from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.request import RequestOut


class FolderCreate(BaseModel):
    name: str


class FolderUpdate(BaseModel):
    name: str


class FolderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    collection_id: int
    name: str
    created_at: datetime
    requests: list[RequestOut] = []
