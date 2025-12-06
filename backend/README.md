# IFRS 17 RAG Chatbot Backend

A LangGraph-powered RAG (Retrieval-Augmented Generation) chatbot backend for the IFRS 17 Training Game. This backend provides an intelligent Q&A system that answers questions about IFRS 17 insurance accounting standards using official documentation.

## Features

- 🔍 **RAG Architecture**: Retrieves relevant context from IFRS 17 documents before generating responses
- 🧠 **LangGraph Workflow**: Structured agent workflow with state management
- 📚 **Document Processing**: Ingests PDF and text documents about IFRS 17
- 🚀 **FastAPI Backend**: High-performance async API endpoints
- 💾 **Vector Store**: ChromaDB for efficient similarity search

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py        # API route definitions
│   │   └── schemas.py       # Pydantic models
│   ├── core/
│   │   ├── __init__.py
│   │   ├── graph.py         # LangGraph workflow definition
│   │   ├── nodes.py         # Graph node functions
│   │   └── state.py         # Graph state definition
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── retriever.py     # Document retrieval logic
│   │   ├── embeddings.py    # Embedding generation
│   │   └── vectorstore.py   # Vector store management
│   └── utils/
│       ├── __init__.py
│       ├── document_loader.py  # Document ingestion
│       └── text_splitter.py    # Text chunking
├── data/
│   ├── documents/           # Place IFRS 17 PDFs here
│   └── chroma_db/           # Vector store persistence
├── tests/
│   ├── __init__.py
│   └── test_api.py
├── requirements.txt
├── .env.example
└── README.md
```

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

3. **Add Documents**
   Place IFRS 17 PDF documents in `data/documents/`

4. **Run the Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

- `POST /api/chat` - Send a message and receive a response
- `POST /api/ingest` - Ingest new documents into the vector store
- `GET /api/health` - Health check endpoint

## License

MIT License - Kenbright
