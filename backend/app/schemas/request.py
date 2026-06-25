from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import KeyValue


class RequestScripts(BaseModel):
    pre_request: str = ""
    test: str = ""


class RequestSettings(BaseModel):
    ssl_verification: bool = True
    follow_redirects: bool = True
    max_redirects: int = 10
    encode_url: bool = True
    http_version: str = "auto"
    follow_original_method: bool = False
    follow_authorization_header: bool = False
    remove_referer_on_redirect: bool = False
    strict_http_parser: bool = False
    disable_cookie_jar: bool = False
    use_server_cipher_suite: bool = False


class RequestBase(BaseModel):
    name: str = "New Request"
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
    folder_id: int | None = None
    sort_order: int = 0


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    name: str | None = None
    method: str | None = None
    url: str | None = None
    query_params: list[KeyValue] | None = None
    headers: list[KeyValue] | None = None
    body_mode: str | None = None
    body_raw: str | None = None
    body_raw_type: str | None = None
    body_form: list[KeyValue] | None = None
    auth_type: str | None = None
    auth_data: dict | None = None
    scripts: RequestScripts | None = None
    settings: RequestSettings | None = None
    folder_id: int | None = None
    sort_order: int | None = None


class RequestOut(RequestBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    collection_id: int
    created_at: datetime
    updated_at: datetime
