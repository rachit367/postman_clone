from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VariableIn(BaseModel):
    key: str = ""
    value: str = ""
    is_secret: bool = False
    enabled: bool = True


class VariableOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    value: str
    is_secret: bool
    enabled: bool


class EnvironmentCreate(BaseModel):
    workspace_id: int
    name: str
    variables: list[VariableIn] = Field(default_factory=list)


class EnvironmentUpdate(BaseModel):
    name: str | None = None
    variables: list[VariableIn] | None = None


class EnvironmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    variables: list[VariableOut] = []


class RevealOut(BaseModel):
    value: str
