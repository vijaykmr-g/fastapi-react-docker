from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, db, schemas

app = FastAPI()

def get_db():
    db_session = db.sessionlocal()  # create session
    try:
        yield db_session
    finally:
        db_session.close()

# Allow React frontend
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/products",response_model=list[schemas.ProductResponse])
def productlists(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products


@app.post("/products",response_model=schemas.ProductResponse)
def createproduct(product:schemas.ProductCreate,db:Session = Depends(get_db)):
    new_product = models.Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock_quantity=product.stock_quantity,
    )
    db.add(new_product)
    db.commit()
    return new_product

@app.put("/products/{product_id}",response_model=schemas.ProductResponse)
def update_product(product_id:int,updated_data:schemas.ProductUpdate,db:Session=  Depends(get_db)):
    print('product detail is',product_id)
    product = db.query(models.Product).filter(models.Product.product_id==product_id).first()
    if not product:
        raise HTTPException(status_code=404,detail="product not found")
    print('product detail is',product.name)
    print('product detail is',product.description)
    print('product detail is',product.price)
    print('product detail is',product.stock_quantity)
    print(type(updated_data),updated_data)
    print(updated_data.name)
    product.name = updated_data.name
    product.description = updated_data.description
    product.price = updated_data.price
    product.stock_quantity= updated_data.stock_quantity
    db.commit()
    return product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}