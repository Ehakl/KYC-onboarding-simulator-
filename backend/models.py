# models.py
# This file defines how our data is structured both in the database (SQLAlchemy models)
# and in our API requests/responses (Pydantic schemas).

import uuid
from sqlalchemy import Column, String, DateTime
from database import Base
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# -------------------------------------------------------------------
# SQLAlchemy ORM Models (Database Tables)
# -------------------------------------------------------------------

class KYCSession(Base):
    """
    Represents a KYC session in the database.
    Each user going through the onboarding process gets a unique session.
    """
    # The name of the table in the database
    __tablename__ = "kyc_sessions"

    # Define columns for the table.
    # id: A unique string identifier (UUID) for the session. It acts as the primary key.
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # status: Tracks the current stage of the KYC process.
    # Possible values: PENDING, DOCUMENT_UPLOADED, FACE_VERIFIED, COMPLETED, FAILED
    status = Column(String, default="PENDING")
    
    # We store the extracted text fields from the OCR process.
    extracted_name = Column(String, nullable=True)
    extracted_dob = Column(String, nullable=True)
    extracted_id_number = Column(String, nullable=True)
    
    # Store file paths to the uploaded images so we can reference them later.
    document_image_path = Column(String, nullable=True)
    selfie_image_path = Column(String, nullable=True)
    
    # created_at: Automatically record when the session was created.
    created_at = Column(DateTime, default=datetime.utcnow)

# -------------------------------------------------------------------
# Pydantic Schemas (API Data Validation)
# -------------------------------------------------------------------
# We use Pydantic schemas to validate data coming in from the user and format data going out.
# This separates our database structure from our API structure, which is a good practice.

class SessionResponse(BaseModel):
    """
    Schema for the response returned when querying a session.
    """
    id: str
    status: str
    extracted_name: Optional[str] = None
    extracted_dob: Optional[str] = None
    extracted_id_number: Optional[str] = None
    created_at: datetime

    class Config:
        # 'orm_mode' tells Pydantic to read data even if it is an ORM model, not just a dictionary.
        # This is essential when returning SQLAlchemy models directly from FastAPI endpoints.
        from_attributes = True

class FaceVerificationRequest(BaseModel):
    """
    Schema for the incoming request when verifying a face.
    Expects the ID of the session and a base64 encoded image of the selfie.
    """
    session_id: str
    selfie_base64: str
