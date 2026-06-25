from fastapi import APIRouter

from app.routes.collection import router as collection_router
from app.routes.environment import router as environment_router
from app.routes.history import router as history_router
from app.routes.request import router as request_router
from app.routes.run import router as run_router
from app.routes.workspace import router as workspace_router

api_router = APIRouter(prefix="/api")
api_router.include_router(workspace_router)
api_router.include_router(collection_router)
api_router.include_router(request_router)
api_router.include_router(environment_router)
api_router.include_router(history_router)
api_router.include_router(run_router)
