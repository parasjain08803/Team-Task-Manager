import os
from sqlalchemy import create_engine
from app.core.database import Base, get_db
from app.models import *
from app.core.config import settings

def create_tables():

    try:
        engine = create_engine(settings.DATABASE_URL)
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")

