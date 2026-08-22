# 🪪 AI-Powered KYC Onboarding Simulator

A full-stack **Know Your Customer (KYC)** verification application that simulates real-world identity verification workflows using AI-powered document processing and facial recognition.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Document Upload & OCR** | Upload ID documents (Aadhaar, PAN, Passport, Driver's License) and extract information using EasyOCR |
| 🔐 **Identity Verification** | Multi-step verification workflow: Upload → OCR → Selfie → Face Match → Result |
| 📷 **Webcam Face Verification** | Capture selfie via webcam and compare with document photo using DeepFace |
| ⚛️ **Interactive Dashboard** | React-based dashboard with real-time status updates and session history |
| 🔮 **AI/CV Integration** | EasyOCR + OpenCV + DeepFace working together for document processing |
| 🐳 **Dockerized** | Full Docker Compose setup for one-command deployment |

---

## 🏗️ Tech Stack

### Backend
- **Python 3.11** — Core language
- **FastAPI** — High-performance async web framework
- **EasyOCR** — Optical Character Recognition for text extraction
- **DeepFace** — Face detection and verification
- **OpenCV** — Image processing and manipulation
- **SQLAlchemy + SQLite** — ORM and lightweight database
- **Uvicorn** — ASGI server

### Frontend
- **React 18** — UI library
- **Vite** — Next-generation build tool
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first CSS framework
- **react-webcam** — Webcam capture
- **Axios** — HTTP client

### DevOps
- **Docker & Docker Compose** — Containerization
- **Render** — Backend deployment
- **Vercel** — Frontend deployment

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/Ehakl/kyc-onboarding-simulator.git
cd kyc-onboarding-simulator

# Start everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Run Locally

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

---

## 📁 Project Structure

```
kyc-onboarding-simulator/
├── backend/
│   ├── services/
│   │   ├── ocr_service.py      # EasyOCR document text extraction
│   │   └── face_service.py     # DeepFace face verification
│   ├── main.py                 # FastAPI app & routes
│   ├── models.py               # Pydantic schemas & DB models
│   ├── database.py             # SQLite + SQLAlchemy setup
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js          # Axios HTTP client
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Stepper.jsx
│   │   │   ├── FileDropzone.jsx
│   │   │   ├── WebcamCapture.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── FaceVerification.jsx
│   │   │   └── StatusPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload-document` | Upload an ID document for OCR processing |
| `POST` | `/api/verify-face` | Submit webcam selfie for face verification |
| `GET` | `/api/status/{session_id}` | Get KYC session status and details |
| `GET` | `/api/sessions` | List all KYC sessions |

### Interactive API Docs
Once the backend is running, visit **http://localhost:8000/docs** for the auto-generated Swagger UI.

---

## 🔄 Verification Workflow

```
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌───────────┐
│  START    │───▶│ Upload Doc   │───▶│ Webcam Selfie  │───▶│  RESULT   │
│          │    │  + OCR       │    │  + Face Match  │    │           │
│ Create   │    │ Extract:     │    │ Compare:       │    │ ✅ Verified│
│ Session  │    │ - Name       │    │ - Doc photo    │    │ ❌ Failed  │
│          │    │ - DOB        │    │   vs Selfie    │    │           │
│          │    │ - ID Number  │    │                │    │           │
└──────────┘    └──────────────┘    └────────────────┘    └───────────┘
```

---

## 🚢 Deployment

### Backend → Render
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `pip install -r requirements.txt`
5. Set **Start Command** to `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel
1. Import your repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add env variable: `VITE_API_URL` = your Render backend URL

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Aditya Bansode** — [@Ehakl](https://github.com/Ehakl)
