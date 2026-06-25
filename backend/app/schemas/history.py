from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    method: str
    url: str
    request_snapshot: dict
    status_code: int | None = None
    response_time_ms: int | None = None
    response_size_bytes: int | None = None
    response_snapshot: dict
    created_at: datetime
