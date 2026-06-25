from sqlalchemy import delete

from app.config.database import SessionLocal
from app.models import Collection, Environment, History, Workspace
from app.repositories import collection as collection_repo
from app.repositories import environment as environment_repo
from app.repositories import history as history_repo
from app.repositories import request as request_repo
from app.repositories import workspace as workspace_repo
from app.schemas.collection import CollectionCreate
from app.schemas.environment import EnvironmentCreate, VariableIn
from app.schemas.request import RequestCreate
from app.schemas.workspace import WorkspaceCreate


def _clear(db):
    db.execute(delete(History))
    db.execute(delete(Collection))
    db.execute(delete(Environment))
    db.execute(delete(Workspace))
    db.commit()


def _seed_collections(db, workspace_id):
    sample = collection_repo.create_collection(
        db,
        CollectionCreate(
            workspace_id=workspace_id, name="Sample API", description="Public test endpoints"
        ),
    )
    request_repo.create_request(
        db,
        sample.id,
        RequestCreate(name="Get IP", method="GET", url="https://httpbin.org/get", query_params=[]),
    )
    request_repo.create_request(
        db,
        sample.id,
        RequestCreate(
            name="Create Post",
            method="POST",
            url="https://jsonplaceholder.typicode.com/posts",
            headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
            body_mode="raw",
            body_raw='{\n  "title": "hello",\n  "body": "world",\n  "userId": 1\n}',
            body_raw_type="json",
        ),
    )
    request_repo.create_request(
        db,
        sample.id,
        RequestCreate(
            name="Bearer Example",
            method="GET",
            url="https://httpbin.org/bearer",
            auth_type="bearer",
            auth_data={"token": "demo-token-123"},
        ),
    )

    todos = collection_repo.create_collection(
        db,
        CollectionCreate(
            workspace_id=workspace_id, name="JSONPlaceholder", description="Typicode demo"
        ),
    )
    request_repo.create_request(
        db,
        todos.id,
        RequestCreate(name="List Todos", method="GET", url="{{base_url}}/todos"),
    )


def _seed_environments(db, workspace_id):
    dev = environment_repo.create_environment(
        db,
        EnvironmentCreate(
            workspace_id=workspace_id,
            name="Development",
            variables=[
                VariableIn(key="base_url", value="https://jsonplaceholder.typicode.com"),
                VariableIn(key="api_key", value="dev-secret-key", is_secret=True),
            ],
        ),
    )
    environment_repo.create_environment(
        db,
        EnvironmentCreate(
            workspace_id=workspace_id,
            name="HTTPBin",
            variables=[VariableIn(key="base_url", value="https://httpbin.org")],
        ),
    )
    environment_repo.activate_environment(db, dev["id"])


def _seed_history(db, workspace_id):
    history_repo.create_history(
        db,
        workspace_id=workspace_id,
        method="GET",
        url="https://httpbin.org/get",
        request_snapshot={"method": "GET", "url": "https://httpbin.org/get"},
        status_code=200,
        response_time_ms=180,
        response_size_bytes=512,
        response_snapshot={"status_code": 200, "body": "{}"},
    )


def run():
    db = SessionLocal()
    try:
        _clear(db)
        workspace = workspace_repo.create_workspace(db, WorkspaceCreate(name="My Workspace"))
        _seed_collections(db, workspace.id)
        _seed_environments(db, workspace.id)
        _seed_history(db, workspace.id)
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
