"""
IFRS 17 RAG Chatbot - FastAPI Main Application
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.api.routes import router as api_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def configure_langsmith():
    """Configure LangSmith tracing for observability."""
    if settings.LANGCHAIN_TRACING_V2 and settings.LANGCHAIN_API_KEY:
        # Set environment variables for LangChain/LangSmith
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGCHAIN_ENDPOINT
        os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
        os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
        
        logger.info("📊 LangSmith tracing enabled")
        logger.info(f"   Project: {settings.LANGCHAIN_PROJECT}")
        return True
    else:
        logger.info("📊 LangSmith tracing disabled (no API key or tracing disabled)")
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup
    logger.info("🚀 Starting IFRS 17 RAG Chatbot Backend...")
    logger.info(f"📚 Documents directory: {settings.DOCS_DIRECTORY}")
    logger.info(f"🗄️ Vector store: {settings.VECTOR_STORE_TYPE}")
    
    # Configure LangSmith observability
    configure_langsmith()
    
    # TODO: Initialize vector store and load documents on startup
    # from app.rag.vectorstore import initialize_vectorstore
    # await initialize_vectorstore()
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down IFRS 17 RAG Chatbot Backend...")


app = FastAPI(
    title="IFRS 17 RAG Chatbot API",
    description="A LangGraph-powered RAG chatbot for IFRS 17 insurance accounting questions",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "message": "IFRS 17 RAG Chatbot API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
