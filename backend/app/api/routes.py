"""
API Route Definitions
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional, AsyncGenerator
import time
import uuid
import logging
import json

from app.api.schemas import (
    ChatRequest, 
    ChatResponse, 
    IngestRequest, 
    IngestResponse,
    HealthResponse,
    SourceDocument
)
from app.rag.vectorstore import get_document_count, add_documents, clear_vectorstore, similarity_search
from app.utils.document_loader import load_documents
from app.utils.text_splitter import split_documents
from app.core.graph import process_query
from app.core.streaming import stream_chat_response

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        doc_count = get_document_count()
        return HealthResponse(
            status="healthy",
            version="1.0.0",
            vector_store_ready=doc_count > 0,
            documents_count=doc_count
        )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(
            status="degraded",
            version="1.0.0",
            vector_store_ready=False,
            documents_count=0
        )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - processes user questions about IFRS 17.
    
    This endpoint:
    1. Retrieves relevant documents from the vector store
    2. Uses LangGraph to process the query with context
    3. Returns the AI-generated answer with sources
    """
    start_time = time.time()
    
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Process query through LangGraph RAG pipeline
        result = await process_query(request.message, conversation_id)
        
        # Format sources
        sources = []
        if request.include_sources and result.get("sources"):
            for src in result["sources"]:
                sources.append(
                    SourceDocument(
                        content=src.get("content", "")[:500],  # Truncate for response
                        source=src.get("source", "Unknown"),
                        page=src.get("page"),
                        relevance_score=src.get("relevance_score", 0.0)
                    )
                )
        
        processing_time = time.time() - start_time
        
        return ChatResponse(
            answer=result.get("answer", "I couldn't generate an answer."),
            sources=sources,
            conversation_id=conversation_id,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint - streams responses token by token.
    
    Uses Server-Sent Events (SSE) to stream the response.
    """
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    # Convert chat history to list of dicts
    chat_history = [{"role": msg.role, "content": msg.content} for msg in (request.chat_history or [])]
    
    # Convert game context to dict if provided
    game_context = request.game_context.model_dump() if request.game_context else None
    
    return StreamingResponse(
        stream_chat_response(request.message, conversation_id, chat_history, game_context),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Conversation-ID": conversation_id
        }
    )

@router.post("/ingest", response_model=IngestResponse)
async def ingest_documents(request: IngestRequest):
    """
    Ingest documents into the vector store.
    
    This endpoint:
    1. Loads documents from the specified path or default directory
    2. Splits documents into chunks
    3. Generates embeddings and stores in vector database
    """
    from app.utils.document_loader import load_documents
    from app.utils.text_splitter import split_documents
    from app.rag.vectorstore import get_vectorstore, add_documents, clear_vectorstore
    from app.config import settings
    
    try:
        # Determine document path
        document_path = request.document_path or settings.DOCUMENTS_DIR
        
        logger.info(f"Starting document ingestion from: {document_path}")
        
        # Clear existing documents if refresh requested
        if request.refresh_all:
            logger.info("Clearing existing vector store...")
            clear_vectorstore()
        
        # Load documents
        documents = load_documents(document_path)
        if not documents:
            return IngestResponse(
                success=False,
                documents_processed=0,
                chunks_created=0,
                message=f"No documents found in {document_path}"
            )
        
        logger.info(f"Loaded {len(documents)} documents")
        
        # Split documents into chunks
        chunks = split_documents(documents)
        logger.info(f"Created {len(chunks)} chunks from documents")
        
        # Add to vector store
        add_documents(chunks)
        
        return IngestResponse(
            success=True,
            documents_processed=len(documents),
            chunks_created=len(chunks),
            message=f"Successfully ingested {len(documents)} documents into {len(chunks)} chunks"
        )
        
    except Exception as e:
        logger.error(f"Error ingesting documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))
