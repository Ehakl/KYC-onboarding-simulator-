# services/face_service.py
# This service handles face detection and comparison.
# We use DeepFace, a lightweight wrapper for several state-of-the-art face recognition models (like VGG-Face, Facenet, etc.).

import cv2
import numpy as np
import base64
from deepface import DeepFace

def verify_faces(document_image_path: str, selfie_base64: str) -> dict:
    """
    Compares the face found in the document image with the face provided in the selfie.
    
    Args:
        document_image_path (str): Path to the uploaded document image.
        selfie_base64 (str): Base64 encoded string of the selfie image captured from the webcam.
        
    Returns:
        dict: A dictionary containing 'is_match' (boolean) and 'similarity' (float).
    """
    
    # 1. Convert the base64 selfie string into an image format OpenCV can process.
    # Base64 is often prefixed with metadata (e.g., "data:image/jpeg;base64,..."). We need to strip that.
    if "," in selfie_base64:
        selfie_base64 = selfie_base64.split(",")[1]
        
    # Decode the base64 string into bytes
    img_data = base64.b64decode(selfie_base64)
    # Convert bytes into a NumPy array (which OpenCV uses to represent images)
    nparr = np.frombuffer(img_data, np.uint8)
    # Decode the array into an actual image matrix
    selfie_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if selfie_image is None:
         raise ValueError("Could not decode the selfie image.")

    # 2. Save the selfie temporarily (DeepFace often works best with file paths)
    temp_selfie_path = "uploads/temp_selfie.jpg"
    cv2.imwrite(temp_selfie_path, selfie_image)

    try:
        # 3. Perform face verification using DeepFace.
        # DeepFace.verify() detects faces in both images and computes the distance (difference) between them.
        # We use 'VGG-Face' as the model and 'cosine' as the metric.
        # enforce_detection=True ensures that it throws an error if no face is found in either image.
        result = DeepFace.verify(
            img1_path=document_image_path,
            img2_path=temp_selfie_path,
            model_name="VGG-Face",
            distance_metric="cosine",
            enforce_detection=True
        )
        
        # 'verified' is a boolean flag returned by DeepFace indicating if the faces match based on a predefined threshold.
        is_match = result.get("verified", False)
        # 'distance' measures how different they are. Lower distance = higher similarity.
        distance = result.get("distance", 1.0)
        
        # Convert distance to a similarity score (0 to 1 scale) for easier understanding.
        # Cosine distance ranges from 0 to 2, where 0 is identical.
        similarity = max(0.0, 1.0 - (distance / 2.0))

        return {
            "is_match": is_match,
            "similarity": similarity,
            "confidence": similarity # Using similarity as a proxy for confidence here
        }
        
    except ValueError as e:
        # DeepFace raises a ValueError if it cannot detect a face in one of the images.
        print(f"Face detection error: {e}")
        return {
            "is_match": False,
            "similarity": 0.0,
            "confidence": 0.0,
            "error": "Face not detected in one or both images."
        }
