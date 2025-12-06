# Development Setup Guide

## Prerequisites

- Python 3.10+ 
- Node.js 18+ (for frontend)
- OpenAI API Key

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
# Required: OPENAI_API_KEY
```

### 5. Add IFRS 17 Documents
Place PDF files in `data/documents/`:
- Download the official IFRS 17 standard
- Add any supplementary materials

### 6. Start the Server
```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Or run directly
python -m app.main
```

### 7. Verify Installation
Open http://localhost:8000/docs for interactive API documentation.

---

## Frontend Integration

### 1. Add Environment Variable
In your React app's `.env`:
```
REACT_APP_CHATBOT_API=http://localhost:8000
```

### 2. The ChatbotIcon is Already Integrated
The floating chat icon has been added to `IFRS17TrainingGame.js`.

### 3. Build the Chat Panel (Next Step)
Create `src/components/ChatbotPanel.js` to handle:
- Message display
- User input
- API communication

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## Common Issues

### "Import could not be resolved"
Install dependencies: `pip install -r requirements.txt`

### "OPENAI_API_KEY not found"
Ensure `.env` file exists with valid API key.

### CORS Errors
Check that your frontend URL is in `CORS_ORIGINS` in `.env`.

---

## Project Structure After Setup

```
project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── rag/
│   │   └── utils/
│   ├── data/
│   │   ├── documents/    ← Put PDFs here
│   │   └── chroma_db/    ← Vector store (auto-created)
│   ├── tests/
│   ├── .env              ← Your config (create from .env.example)
│   └── requirements.txt
├── docs/
│   ├── CHATBOT_IMPLEMENTATION_PLAN.md
│   ├── API_REFERENCE.md
│   └── SETUP_GUIDE.md
└── src/
    └── components/
        └── ChatbotIcon.js  ← Already created
```
