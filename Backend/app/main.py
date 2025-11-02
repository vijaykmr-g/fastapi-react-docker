from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React frontend (localhost:3000) to talk to FastAPI (localhost:8000)
origins = [
    "http://localhost:3000",  # React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # allow React
    allow_credentials=True,
    allow_methods=["*"],             # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # allow all headers
)

users = [
    {"id": 1, "name": "Ajay", "email": "ajay@example.com", "phone": "9876543210"},
    {"id": 2, "name": "Vijay", "email": "vijay@example.com", "phone": "9988776655"},
    {"id": 3, "name": "Ankita", "email": "ankita@example.com", "phone": "9123456780"},
]


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI + Docker (with CORS)!","data":users}