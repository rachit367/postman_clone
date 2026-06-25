from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.middlewares.error_handler import register_error_handlers
from app.routes import api_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Postman Clone API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_error_handlers(app)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    app.include_router(api_router)
    return app


app = create_app()
