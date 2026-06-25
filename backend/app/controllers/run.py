from sqlalchemy.orm import Session

from app.schemas.run import RunRequest
from app.services import runner


def run_request(db: Session, payload: RunRequest) -> dict:
    return runner.execute(payload, db)
