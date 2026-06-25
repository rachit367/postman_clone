from pydantic import BaseModel, Field

from app.schemas.common import KeyValue
from app.schemas.request import RequestScripts, RequestSettings


class RunRequest(BaseModel):
    method: str = "GET"
    url: str = ""
    query_params: list[KeyValue] = Field(default_factory=list)
    headers: list[KeyValue] = Field(default_factory=list)
    body_mode: str = "none"
    body_raw: str | None = None
    body_raw_type: str | None = "json"
    body_form: list[KeyValue] = Field(default_factory=list)
    auth_type: str = "none"
    auth_data: dict = Field(default_factory=dict)
    scripts: RequestScripts = Field(default_factory=RequestScripts)
    settings: RequestSettings = Field(default_factory=RequestSettings)
    environment_id: int | None = None


class TestResult(BaseModel):
    name: str
    passed: bool
    error: str | None = None


class RunResponse(BaseModel):
    status_code: int
    status_text: str
    headers: list[KeyValue]
    body: str
    time_ms: int
    size_bytes: int
    tests: list[TestResult] = Field(default_factory=list)
    logs: list[str] = Field(default_factory=list)
