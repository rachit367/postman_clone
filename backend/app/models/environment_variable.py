from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class EnvironmentVariable(Base):
    __tablename__ = "environment_variables"

    id: Mapped[int] = mapped_column(primary_key=True)
    environment_id: Mapped[int] = mapped_column(
        ForeignKey("environments.id", ondelete="CASCADE"), nullable=False
    )
    key: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[str] = mapped_column(Text, default="")
    is_secret: Mapped[bool] = mapped_column(Boolean, default=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    environment: Mapped["Environment"] = relationship(back_populates="variables")
