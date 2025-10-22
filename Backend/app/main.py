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

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI + Docker (with CORS)!"}