# database.py
# This file sets up our connection to the SQLite database.
# In a real production app, you might use PostgreSQL or MySQL, but SQLite is perfect for learning and local development
# because it stores the entire database in a single file on your disk.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# The URL for our database. "sqlite:///./kyc_sessions.db" means create a file named kyc_sessions.db in the current directory.
SQLALCHEMY_DATABASE_URL = "sqlite:///./kyc_sessions.db"

# Create the SQLAlchemy engine. The engine is the starting point for any SQLAlchemy application.
# `check_same_thread=False` is needed for SQLite in FastAPI because FastAPI can handle multiple requests concurrently,
# and SQLite by default restricts a connection to the thread that created it.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a SessionLocal class. Each instance of this class will be a database session.
# We use sessions to talk to the database (querying, adding, updating records).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is a factory function that constructs a base class for declarative class definitions.
# We will inherit from this Base class to create our database models (tables).
Base = declarative_base()

# A dependency function to get a database session.
# This pattern is highly recommended in FastAPI. It opens a new session for each request
# and ensures the session is closed after the request is finished, even if an error occurs.
def get_db():
    db = SessionLocal()
    try:
        yield db # 'yield' makes this a generator. FastAPI uses this to inject the session into endpoints.
    finally:
        db.close()
