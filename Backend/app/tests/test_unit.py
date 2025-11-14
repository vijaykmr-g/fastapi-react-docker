from fastapi.testclient import TestClient
from app.main import app, get_db
from app.db import base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test DB connection
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://test_user:test_pass@localhost:5432/test_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
base.metadata.create_all(bind=engine)

# Dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def register_test_user():
    data = {
        "username": "testuser1",
        "email": "test1@example.com",
        "password": "1234567"
    }
    return client.post("/register", json=data)


def login_test_user():
    data = {
        "username": "testuser1",
        "password": "1234567"
    }
    response = client.post("/login", data=data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_register():
    response = register_test_user()
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser1"
    assert data["email"] == "test1@example.com"


def test_register():
    response = register_test_user()
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser1"
    assert data["email"] == "test1@example.com"
