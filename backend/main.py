import cv2
import numpy as np
# =============================================================================
# main.py — FastAPI Application Entry Point
# =============================================================================
#
# WHAT IS THIS FILE?
# This is the "brain" of our backend. It defines all the API endpoints (URLs)
# that the frontend will send HTTP requests to.
#
# WHAT IS FastAPI?
# FastAPI is a modern Python web framework for building APIs. It's:
# - FAST (high performance, on par with Node.js)
# - EASY (automatic docs, type checking, validation)
# - STANDARD (based on OpenAPI/Swagger specs)
#
# HOW IT WORKS:
# 1. Frontend sends HTTP request (e.g., POST /api/upload-document)
# 2. FastAPI matches the URL to a function (called an "endpoint" or "route")
# 3. The function processes the request and returns a JSON response
# 4. Frontend receives the response and updates the UI
#
# =============================================================================

import os
import shutil
import uuid
import base64

from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import our local modules
from database import engine, Base, get_db
from models import KYCSession, SessionResponse, FaceVerificationRequest
from services.ocr_service import extract_document_info
from services.face_service import verify_faces

# =============================================================================
# 1. DATABASE INITIALIZATION
# =============================================================================
# Create all database tables defined in models.py.
# If the tables already exist, this does nothing (safe to call multiple times).
Base.metadata.create_all(bind=engine)

# =============================================================================
# 2. FILE UPLOAD DIRECTORY
# =============================================================================
# We need a folder to store uploaded ID document images.
# os.makedirs with exist_ok=True creates the folder if it doesn't exist.
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =============================================================================
# 3. CREATE THE FastAPI APP
# =============================================================================
# This creates our application instance. The title and version appear in
# the auto-generated API docs at http://localhost:8000/docs
app = FastAPI(
    title="KYC Onboarding Simulator API",
    version="1.0.0",
    description="AI-Powered KYC verification with OCR and Face Recognition"
)

# =============================================================================
# 4. CORS MIDDLEWARE
# =============================================================================
# CORS = Cross-Origin Resource Sharing
#
# WHY DO WE NEED THIS?
# Browsers block requests from one origin (e.g., localhost:5173) to another
# (e.g., localhost:8000) by default for security. This is called the
# "Same-Origin Policy". CORS headers tell the browser "it's okay, allow it".
#
# Without CORS, your frontend would get this error:
#   "Access to XMLHttpRequest has been blocked by CORS policy"
#
# In production, replace "*" with your actual frontend URL for security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow all origins (use specific URLs in production)
    allow_credentials=True,     # Allow cookies/auth headers
    allow_methods=["*"],        # Allow all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],        # Allow all headers
)


# =============================================================================
# API ENDPOINTS (ROUTES)
# =============================================================================
#
# Each endpoint is a Python function decorated with @app.get(), @app.post(), etc.
# The decorator tells FastAPI: "When someone sends a GET/POST to this URL, run this function."
#
# DEPENDENCY INJECTION:
# Notice `db: Session = Depends(get_db)` in every endpoint.
# This is FastAPI's dependency injection system. It:
# 1. Calls get_db() to create a database session
# 2. Passes that session to our function as the `db` parameter
# 3. Automatically closes the session when the function finishes
# This ensures we never forget to close database connections!
#

# ─── CREATE NEW SESSION ─────────────────────────────────────────────────────────
@app.post("/api/sessions", response_model=SessionResponse)
def create_session(db: Session = Depends(get_db)):
    """
    Creates a new KYC verification session.
    
    This is the FIRST step in the KYC flow. When the user clicks
    "Start KYC Verification" on the landing page, the frontend calls this endpoint.
    
    Returns:
        SessionResponse: The newly created session with a unique ID and PENDING status.
    """
    # Create a new KYCSession instance. 
    # The UUID id and "PENDING" status are set automatically by default values in models.py.
    new_session = KYCSession()
    
    # Add to database and save
    db.add(new_session)         # Stage the new record
    db.commit()                 # Write to disk (SQLite file)
    db.refresh(new_session)     # Reload from DB to get auto-generated fields (id, created_at)
    
    return new_session


# ─── UPLOAD DOCUMENT + OCR ──────────────────────────────────────────────────────
@app.post("/api/upload-document")

def is_blurry(image_path: str, threshold: float = 100.0) -> bool:
    """
    Checks if an image is too blurry for OCR using the Variance of Laplacian method.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return False
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        print(f"Image Blur Variance: {variance}")
        return variance < threshold
    except Exception as e:
        print(f"Blur detection error: {e}")
        return False

@app.post("/api/upload-document")
def upload_document(
    session_id: str = Form(...),           # Session ID from form data
    file: UploadFile = File(...),          # The uploaded file
    db: Session = Depends(get_db)          # Database session (injected)
):
    """
    Accepts an uploaded ID document image, saves it to disk, and runs OCR
    to extract text (Name, DOB, ID Number).
    
    WHAT IS OCR?
    Optical Character Recognition — AI that reads text from images.
    We use EasyOCR to scan the ID document photo and extract information.
    
    WHAT IS multipart/form-data?
    When uploading files via HTTP, the browser encodes the request as
    "multipart/form-data" instead of regular JSON. FastAPI's File() and
    Form() handle this automatically.
    
    Args:
        session_id: The UUID of the current KYC session
        file: The uploaded ID document image (JPEG, PNG, etc.)
    """
    # Step 1: Find the session in the database
    db_session = db.query(KYCSession).filter(KYCSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Step 2: Save the uploaded file to disk
    # We generate a unique filename to prevent overwriting if two users upload
    # files with the same name simultaneously.
    file_extension = os.path.splitext(file.filename)[1]  # e.g., ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"   # e.g., "abc123.jpg"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)  # e.g., "uploads/abc123.jpg"

    try:
        # shutil.copyfileobj efficiently copies the file stream to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # Step 2.5: Pre-processing Fraud Detection (Blur Check)
    if is_blurry(file_path, threshold=50.0):
        # Delete the bad file so we don't waste storage
        os.remove(file_path)
        raise HTTPException(
            status_code=400, 
            detail="Document rejected: Image is too blurry. Please upload a clear, focused photo of the ID."
        )

    # Step 3: Update session status
    db_session.document_image_path = file_path
    db_session.status = "DOCUMENT_UPLOADED"
    db.commit()

    # Step 4: Run OCR to extract information from the document
    try:
        extracted_data = extract_document_info(file_path)
        
        # Save extracted fields to the database
        db_session.extracted_name = extracted_data.get("name")
        db_session.extracted_dob = extracted_data.get("dob")
        db_session.extracted_id_number = extracted_data.get("id_number")
        db.commit()
        
        return {
            "message": "Document uploaded and processed successfully.",
            "session_id": session_id,
            "extracted_data": extracted_data
        }
    except Exception as e:
        # OCR failed, but the document was still saved
        print(f"OCR Error: {e}")
        return {
            "message": "Document uploaded, but OCR processing failed.",
            "session_id": session_id,
            "error": str(e)
        }


# ─── FACE VERIFICATION ──────────────────────────────────────────────────────────
@app.post("/api/verify-face")
def verify_face(request: FaceVerificationRequest, db: Session = Depends(get_db)):
    """
    Accepts a selfie (as a base64-encoded string), compares it against the
    document photo using DeepFace, and determines if the faces match.
    
    WHAT IS BASE64?
    Base64 is a way to encode binary data (like images) as text strings.
    The webcam captures an image and converts it to a base64 string like:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
    This allows us to send the image in a JSON request body.
    
    WHAT IS DeepFace?
    DeepFace is a Python library that wraps several state-of-the-art face
    recognition models (VGG-Face, FaceNet, ArcFace, etc.). It can:
    - Detect faces in images
    - Generate face embeddings (mathematical representations)
    - Compare two faces for similarity
    """
    # Step 1: Find the session
    db_session = db.query(KYCSession).filter(KYCSession.id == request.session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not db_session.document_image_path:
        raise HTTPException(
            status_code=400, 
            detail="Document must be uploaded before face verification."
        )

    # Step 2: Run face verification
    try:
        verification_result = verify_faces(
            db_session.document_image_path,  # Path to the ID document photo
            request.selfie_base64             # Base64 selfie from webcam
        )
        
        # Step 3: Update session status based on result
        if verification_result.get("is_match"):
            db_session.status = "COMPLETED"
        else:
            db_session.status = "FAILED"
        
        db.commit()
        
        return {
            "status": db_session.status,
            "match": verification_result.get("is_match", False),
            "confidence": verification_result.get("confidence", 0.0),
            "similarity": verification_result.get("similarity", 0.0),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face verification failed: {e}")


# ─── GET SESSION STATUS ──────────────────────────────────────────────────────────
@app.get("/api/status/{session_id}", response_model=SessionResponse)
def get_session_status(session_id: str, db: Session = Depends(get_db)):
    """
    Returns the current status and all extracted data for a specific KYC session.
    The frontend polls this endpoint to show real-time progress.
    """
    db_session = db.query(KYCSession).filter(KYCSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # FastAPI + Pydantic automatically converts the SQLAlchemy model to JSON
    # using the SessionResponse schema (because of from_attributes = True)
    return db_session


# ─── LIST ALL SESSIONS ───────────────────────────────────────────────────────────
@app.get("/api/sessions", response_model=list[SessionResponse])
def get_all_sessions(db: Session = Depends(get_db)):
    """
    Returns all KYC sessions, newest first.
    Used by the Dashboard page to show session history.
    """
    sessions = db.query(KYCSession).order_by(KYCSession.created_at.desc()).all()
    return sessions


# =============================================================================
# RUNNING THE APP
# =============================================================================
# To run this app locally:
#   uvicorn main:app --reload --host 0.0.0.0 --port 8000
#
# --reload    → Auto-restart when you change code (dev only)
# --host      → 0.0.0.0 means accept connections from any IP
# --port      → Listen on port 8000
#
# Once running, visit:
#   http://localhost:8000/docs   → Interactive API documentation (Swagger UI)
#   http://localhost:8000/redoc  → Alternative API docs (ReDoc)
# =============================================================================
