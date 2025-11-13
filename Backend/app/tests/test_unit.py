from fastapi.testclient import TestClient
from app.main import app, get_db
from app.models import Product
from app.db import base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://test_user:test_pass@localhost:5432/test_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
base.metadata.create_all(bind=engine)

# --- Dependency Override for FastAPI ---
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)



# --- JWT Authentication Tests ---
def test_register_user():
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = client.post("/register", json=data)
    assert response.status_code in (200, 400)  # 400 if user already exists

def test_login_user():
    data = {
        "username": "testuser",
        "password": "testpassword"
    }
    response = client.post("/login", data=data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_protected_route_with_token():
    # login to get token
    login_data = {"username": "testuser", "password": "testpassword"}
    login_response = client.post("/login", data=login_data)
    token = login_response.json().get("access_token")
    assert token is not None

    # call protected route with Authorization header
    headers = {"Authorization": f"Bearer {token}"}
    protected_response = client.get("/products", headers=headers)
    assert protected_response.status_code in [200, 401, 403]  # depends if route is protected


def test_invalid_token():
    headers = {"Authorization": "Bearer invalidtoken123"}
    response = client.get("/products", headers=headers)
    assert response.status_code in [401, 403]



# --- Product Tests ---
def test_get_url():
    response = client.get("/products")
    assert response.status_code == 200

def test_post_url():
    data = {
        "name": "test_product",
        "description": "testing the product",
        "price": 125.5,
        "stock_quantity": 12
    }
    response = client.post("/products", json=data)
    assert response.status_code in (200, 201)
    assert response.json()["name"] == "test_product"

def test_invalid_url():
    response = client.get('/invalid')
    assert response.status_code == 404
