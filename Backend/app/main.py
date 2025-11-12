from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, db, schemas
from datetime import datetime,timedelta
from jose import JWTError,jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10
SECRET_KEY = "mysecretkey_123"

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(password,hased_password):
    return pwd_context.verify(password,hased_password)

def get_password_hash(password):
    return pwd_context.hash(password)


def createToken(username:str):
    expire = datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"username":username,"expire":expire}
    return jwt.encode(payload,SECRET_KEY,ALGORITHM)

def verifyToken(token:str):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms={ALGORITHM})
        return payload["username"]
    except JWTError:
        raise HTTPException(status_code=400,detail="Invalid Token")

@app.post("/register",response_model=schemas.UserResponse)
def register(user:schemas.UserCreate,db:Session=Depends(get_db)):
    existing_user = db.query(models.Users).filter(models.Users.username==user.username).first()
    if existing_user:
        raise HTTPException(status_code=400,detail="Username Already Exists")
    hashed_password = get_password_hash(user.password)
    new_user = models.Users(username=user.username,email=user.email,hashed_password=user.password)
    db.add(new_user)
    db.commit()
    return new_user

@app.post("/login")
def login(formdata:OAuth2PasswordRequestForm,db:Session=Depends(get_db)):
    user = db.query(models.user).filter(models.Users.username==formdata.username).first()
    if not user or not verify_password(formdata.password,user.hashed_password):
        raise HTTPException(status_code=401,detail="Incorrect username or Password")
    token = createToken(formdata.username)
    return {"access token":token,"token_type":"bearer"}

@app.get("/secure_data")
def secure_data(token:str):
    uname = verifyToken(token)
    return {"Message": f"Hello {uname}, this is secure Enpoint"}

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