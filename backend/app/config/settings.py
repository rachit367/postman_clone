from functools import lru_cache

from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_secret_key: str
    database_url: str = "sqlite:///./postman_clone.db"
    script_sidecar_url: str = "http://127.0.0.1:9111"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as error:
        missing = [str(item["loc"][0]) for item in error.errors() if item["type"] == "missing"]
        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}. "
                f"Set them in backend/.env (see .env.example)."
            ) from error
        raise
