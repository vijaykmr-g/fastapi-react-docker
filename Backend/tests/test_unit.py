from fastapi.testclient import TestClient
from Backend.app.main import app

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