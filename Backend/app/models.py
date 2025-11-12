from sqlalchemy import Column,Integer,DateTime,String,Numeric,Text
from sqlalchemy.sql import func
from .db import base

class Product(base):
    __tablename__ = "product"

    product_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10,2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Users(base):
    __tablename__ = "users"

    userid = Column(Integer, primary_key=True, index=True)
    username = Column(String(50),unique=True,index=True)
    email = Column(String(100),unique=True)
    hased_password = Column(String(255))
    