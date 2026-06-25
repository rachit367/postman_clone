import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config.database import Base
from app.repositories import history as history_repo
from app.schemas.run import RunRequest
from app.services import runner


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    from app.models import Workspace

    session.add(Workspace(id=1, name="WS"))
    session.commit()
    yield session
    session.close()


def test_timeout_maps_to_typed_error(db, monkeypatch):
    def raise_timeout(self, *args, **kwargs):
        raise httpx.TimeoutException("timeout")

    monkeypatch.setattr(httpx.Client, "request", raise_timeout)
    result = runner.execute(RunRequest(method="GET", url="https://example.com", workspace_id=1), db)
    assert result["error"]["type"] == "timeout"


def test_invalid_url_maps_to_typed_error(db, monkeypatch):
    def raise_invalid(self, *args, **kwargs):
        raise httpx.InvalidURL("bad")

    monkeypatch.setattr(httpx.Client, "request", raise_invalid)
    result = runner.execute(RunRequest(method="GET", url="not a url", workspace_id=1), db)
    assert result["error"]["type"] == "invalid_url"


def test_success_records_history_with_size_and_time(db, monkeypatch):
    def fake_request(self, method, url, **kwargs):
        return httpx.Response(
            200,
            headers={"content-type": "application/json"},
            text='{"ok": true}',
            request=httpx.Request(method, url),
        )

    monkeypatch.setattr(httpx.Client, "request", fake_request)
    result = runner.execute(
        RunRequest(method="GET", url="https://example.com/data", workspace_id=1), db
    )
    assert result["status_code"] == 200
    assert result["size_bytes"] == len('{"ok": true}')
    assert result["time_ms"] >= 0
    assert len(history_repo.list_history(db, 1)) == 1
