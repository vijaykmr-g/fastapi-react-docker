from fastapi.testclient import TestClient
from app.main import app
from app.main import get_db
from app.models import Product
from app.db import base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# Temporary test database URL (same as CI service)
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://test_user:test_pass@localhost:5432/test_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Create all tables for testing ---
base.metadata.create_all(bind=engine)

# --- Dependency override for FastAPI ---
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db



client = TestClient(app)

def test_get_url():
    response = client.get("/products")
    assert response.status_code == 200

def test_post_url():
    data ={
        "name":"test_product",
        "description":" testing the prodcut",
        "price":125.5,
        "stock_quantity":12
    }
    response = client.post("/products",json=data)
    assert response.status_code in (200,201)
    assert response.json()["name"] == "test_product"


def test_invalid_url():
    response = client.get('/invalid')
    assert response.status_code == 404