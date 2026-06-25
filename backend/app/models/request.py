from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.config.database import Base


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    collection_id: Mapped[int] = mapped_column(
        ForeignKey("collections.id", ondelete="CASCADE"), nullable=False
    )
    folder_id: Mapped[int | None] = mapped_column(
        ForeignKey("folders.id", ondelete="CASCADE"), default=None
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    method: Mapped[str] = mapped_column(String, default="GET")
    url: Mapped[str] = mapped_column(Text, default="")
    query_params: Mapped[list] = mapped_column(JSON, default=list)
    headers: Mapped[list] = mapped_column(JSON, default=list)
    body_mode: Mapped[str] = mapped_column(String, default="none")
    body_raw: Mapped[str | None] = mapped_column(Text, default=None)
    body_raw_type: Mapped[str | None] = mapped_column(String, default="json")
    body_form: Mapped[list] = mapped_column(JSON, default=list)
    auth_type: Mapped[str] = mapped_column(String, default="none")
    auth_data: Mapped[dict] = mapped_column(JSON, default=dict)
    scripts: Mapped[dict] = mapped_column(JSON, default=dict)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    collection: Mapped["Collection"] = relationship(back_populates="requests")
    folder: Mapped["Folder | None"] = relationship(back_populates="requests")
