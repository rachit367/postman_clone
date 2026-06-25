from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    collections: Mapped[list["Collection"]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan"
    )
    environments: Mapped[list["Environment"]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan"
    )
    history: Mapped[list["History"]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan"
    )
