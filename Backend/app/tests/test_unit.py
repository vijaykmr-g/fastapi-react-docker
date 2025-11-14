from fastapi.testclient import TestClient
from app.main import app, get_db
from app.models import Product
from app.db import base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# --- Test Database Setup ---
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://test_user:test_pass@localhost:5432/test_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
base.metadata.create_all(bind=engine)

# --- Dependency Override ---
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
        "username": "testuser2",
        "email": "test@example.com",
        "password": "123456"
    }
    response = client.post("/register", json=data)
    # If user exists already, skip error
    assert response.status_code in (200, 400)


def login_test_user():
    response = client.post(
        "/login",
        data={"username": "testuser2", "password": "123456"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 200, response.text
    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


# --- Helper to login and get token ---
def get_auth_header():
    login_data = {"username": "testuser2", "password": "123456"}
    login_response = client.post("/login", data=login_data)
    token = login_response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}



# --- CRUD Tests ---

def test_get_url():
    headers = get_auth_header()
    response = client.get("/products", headers=headers)
    assert response.status_code == 200


def test_post_url():
    headers = get_auth_header()
    data = {
        "name": "test_product",
        "description": "testing the product",
        "price": 125.5,
        "stock_quantity": 12
    }
    response = client.post("/products", json=data, headers=headers)
    assert response.status_code in (200, 201)
    assert response.json()["name"] == "test_product"

def test_invalid_url():
    headers = get_auth_header()
    response = client.get("/invalid", headers=headers)
    assert response.status_code == 404

def test_update_product():
    headers = get_auth_header()
    # First, create a product
    data = {
        "name": "update_product",
        "description": "before update",
        "price": 100,
        "stock_quantity": 5
    }
    create_resp = client.post("/products", json=data, headers=headers)
    product_id = create_resp.json()["product_id"]

    # Update it
    update_data = {
        "name": "updated_name",
        "description": "after update",
        "price": 150,
        "stock_quantity": 10
    }
    update_resp = client.put(f"/products/{product_id}", json=update_data, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "updated_name"

def test_delete_product():
    headers = get_auth_header()
    # First, create a product
    data = {
        "name": "delete_product",
        "description": "to delete",
        "price": 50,
        "stock_quantity": 2
    }
    create_resp = client.post("/products", json=data, headers=headers)
    product_id = create_resp.json()["product_id"]

    # Delete it
    delete_resp = client.delete(f"/products/{product_id}", headers=headers)
    assert delete_resp.status_code == 200

def test_invalid_token():
    headers = {"Authorization": "Bearer invalidtoken123"}
    response = client.get("/products", headers=headers)
    assert response.status_code in [401, 403]
