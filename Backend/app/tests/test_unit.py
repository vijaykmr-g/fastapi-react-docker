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


# -------------------------
#  Register Test User
# -------------------------
def register_test_user():
    data = {
        "username": "testuser4",
        "email": "test@example.com",
        "password": "1234567"
    }
    response = client.post("/register", json=data)
    assert response.status_code in (200, 400)  # 400 = already exists
    return response


# -------------------------
#  Login Test User
# -------------------------
def login_test_user():
    response = client.post(
        "/login",
        data="username=testuser4&password=1234567",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 200, response.text

    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
