# services/ocr_service.py
# This service is responsible for extracting text from ID documents.
# We are using EasyOCR, a popular optical character recognition library based on PyTorch.

import easyocr
import re
import cv2
import numpy as np

# We initialize the EasyOCR reader outside the function so it only loads into memory once.
# 'en' specifies English language support.
# gpu=False forces it to use CPU (useful for compatibility, though GPU is faster).
print("Initializing EasyOCR... This might take a moment.")
reader = easyocr.Reader(['en'], gpu=False)

def extract_document_info(image_path: str) -> dict:
    """
    Takes an image path, runs OCR on it, and attempts to extract Name, DOB, and ID Number
    using regular expressions (regex).
    
    Args:
        image_path (str): The path to the saved document image on disk.
        
    Returns:
        dict: A dictionary containing extracted 'name', 'dob', 'id_number' and a 'confidence' score.
    """
    # 1. Read the image using OpenCV. We use OpenCV because it provides robust image handling.
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image at {image_path}")

    # (Optional preprocessing) - In a real app, you might resize, convert to grayscale, 
    # or increase contrast here to improve OCR accuracy.
    # gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 2. Perform OCR
    # The readtext method returns a list of tuples: (bounding_box, text, confidence_score)
    # detail=0 returns just the text. detail=1 returns the full tuple.
    results = reader.readtext(image, detail=1)

    extracted_text = []
    total_confidence = 0
    count = 0

    # 3. Process the results
    for (bbox, text, prob) in results:
        extracted_text.append(text)
        total_confidence += prob
        count += 1
        
    # Join all detected text into a single string for easier regex searching
    full_text = " \n ".join(extracted_text)
    
    avg_confidence = (total_confidence / count) if count > 0 else 0

    # 4. Parse fields using Regular Expressions (Regex)
    # Regex is a powerful tool for finding patterns in text.
    # Note: These patterns are simplified for the simulator. Real IDs require very complex rules.

    # Find Date of Birth (looking for DD/MM/YYYY or similar patterns)
    # \d{2} means two digits, [/-] means either a slash or a dash.
    dob_match = re.search(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b', full_text)
    dob = dob_match.group(0) if dob_match else None

    # Find ID Number (Example: assuming a 10-12 digit/alphanumeric code like PAN or Aadhaar)
    # This is a very generic pattern. 
    # Let's try to match a typical PAN format (5 letters, 4 numbers, 1 letter)
    id_match = re.search(r'[A-Z]{5}[0-9]{4}[A-Z]{1}', full_text)
    if not id_match:
        # Fallback: maybe it's a 12 digit Aadhaar number (e.g. 1234 5678 9012)
        id_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', full_text)
        
    id_number = id_match.group(0) if id_match else None

    # Extract Name (Heuristic approach)
    # Often, the name is on a line by itself, in ALL CAPS, after specific keywords.
    # For this learning example, we'll try to find the longest uppercase string that isn't the ID.
    name = None
    for text in extracted_text:
        # Check if it looks like a name (mostly letters, uppercase)
        if len(text) > 4 and text.isupper() and not re.search(r'\d', text):
            # Exclude common non-name words found on IDs
            if text not in ["GOVT OF INDIA", "REPUBLIC", "INCOME TAX", "PAN", "CARD"]:
                name = text
                break

    return {
        "name": name,
        "dob": dob,
        "id_number": id_number,
        "confidence": avg_confidence,
        "raw_text": full_text # Useful for debugging
    }
