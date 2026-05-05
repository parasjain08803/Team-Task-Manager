from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.startup import create_tables

app = FastAPI(
    title="Team Task Manager API",
    version="1.0.0",
    description="API for Team Task Manager application"
)

@app.on_event("startup")
async def startup_event():
    create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Team Task Manager API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
