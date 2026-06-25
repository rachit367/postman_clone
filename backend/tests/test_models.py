from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.database import Base
from app.models import Collection, Environment, EnvironmentVariable, Request


def make_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


def test_collection_cascade_deletes_requests():
    db = make_session()
    collection = Collection(name="C")
    collection.requests.append(Request(name="R", method="GET", url="http://x"))
    db.add(collection)
    db.commit()
    db.delete(collection)
    db.commit()
    assert db.query(Request).count() == 0


def test_environment_variables_relationship():
    db = make_session()
    env = Environment(name="dev")
    env.variables.append(EnvironmentVariable(key="base", value="http://x"))
    db.add(env)
    db.commit()
    assert db.query(EnvironmentVariable).count() == 1
    assert env.variables[0].key == "base"
