from sqlalchemy import create_engine
from app.core.database import Base
from app.models import *
import os

def init_database():

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not found in environment variables")
        return

    print(f"Connecting to database: {database_url}")
    engine = create_engine(database_url)

    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database()
