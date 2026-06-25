from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.config.database import Base


class History(Base):
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(primary_key=True)
    method: Mapped[str] = mapped_column(String, default="GET")
    url: Mapped[str] = mapped_column(Text, default="")
    request_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    status_code: Mapped[int | None] = mapped_column(Integer, default=None)
    response_time_ms: Mapped[int | None] = mapped_column(Integer, default=None)
    response_size_bytes: Mapped[int | None] = mapped_column(Integer, default=None)
    response_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
