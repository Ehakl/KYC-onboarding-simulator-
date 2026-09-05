# 🛡️ Enterprise KYC Onboarding Simulator

A full-stack Know Your Customer (KYC) application featuring real-time AI document extraction, facial recognition, and enterprise-grade anti-spoofing security.

## 🚀 Key Features

*   **AI Document OCR**: Extracts names, dates of birth, and ID numbers from uploaded documents using EasyOCR.
*   **Image Quality Engine**: OpenCV Laplacian variance checks automatically reject blurry or out-of-focus ID uploads to save processing power.
*   **DeepFace Verification**: Compares the user's live webcam selfie against the ID document with high-accuracy cosine similarity distance matching.
*   **Fourier Transform Anti-Spoofing**: Uses 2D Fast Fourier Transform (FFT) frequency domain analysis to detect Moiré patterns, instantly blocking users attempting to bypass security using digital screens or printed photos.
*   **Admin Analytics Dashboard**: React-based dashboard for reviewing session statuses with one-click CSV data exports.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend**: Python, FastAPI, SQLAlchemy, SQLite
*   **AI & Computer Vision**: OpenCV (cv2), DeepFace, EasyOCR, NumPy

## 🧠 Advanced Security Mechanics

### 1. Pre-Processing Blur Detection
Before expensive OCR models run, the system converts the image to grayscale and calculates the variance of the Laplacian. If the edge variance falls below the strict threshold, it returns a 400 Bad Request.

### 2. Frequency-Domain Liveness Checks (FFT)
To prevent presentation attacks (holding a phone to the webcam), the selfie matrix is passed through an FFT shift. High-frequency pixel grids (inherent to LCD/OLED screens) trigger a massive magnitude spike in the spectrum, allowing the backend to instantly reject the spoof attempt.
