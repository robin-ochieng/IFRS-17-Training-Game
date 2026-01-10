"""
Vector Store Management for IFRS 17 RAG Chatbot
Supports both ChromaDB (local) and Supabase pgvector (production)
"""
import os
import logging
from typing import List, Optional
from langchain_core.documents import Document
from langsmith import traceable

from app.config import settings
from app.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)

# Global vector store instance (for ChromaDB)
_vectorstore = None


def is_using_supabase() -> bool:
    """Check if we're using Supabase pgvector."""
    return settings.VECTOR_STORE_TYPE.lower() == "supabase"


def get_vectorstore():
    """
    Get or create the vector store instance.
    For Supabase, returns None (uses direct client calls).
    For ChromaDB, returns the Chroma instance.
    
    Returns:
        Chroma vector store instance or None for Supabase
    """
    if is_using_supabase():
        # Supabase doesn't use a vectorstore object
        return None
    
    global _vectorstore
    
    if _vectorstore is None:
        from langchain_chroma import Chroma
        
        embeddings = get_embeddings()
        persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        
        # Ensure directory exists
        os.makedirs(persist_directory, exist_ok=True)
        
        _vectorstore = Chroma(
            collection_name="ifrs17_documents",
            embedding_function=embeddings,
            persist_directory=persist_directory
        )
        logger.info(f"ChromaDB vector store initialized at {persist_directory}")
    
    return _vectorstore


def add_documents(documents: List[Document]) -> int:
    """
    Add documents to the vector store.
    
    Args:
        documents: List of Document objects to add
        
    Returns:
        Number of documents added
    """
    if not documents:
        return 0
    
    if is_using_supabase():
        from app.rag.supabase_vectorstore import add_documents_supabase
        return add_documents_supabase(documents)
    else:
        vectorstore = get_vectorstore()
        vectorstore.add_documents(documents)
        logger.info(f"Added {len(documents)} documents to ChromaDB")
        return len(documents)


@traceable(name="similarity_search", run_type="retriever")
def similarity_search(
    query: str, 
    k: int = None,
    score_threshold: float = None
) -> List[Document]:
    """
    Search for similar documents.
    
    Args:
        query: Search query
        k: Number of results to return
        score_threshold: Minimum similarity score
        
    Returns:
        List of matching documents with scores in metadata
    """
    if is_using_supabase():
        from app.rag.supabase_vectorstore import similarity_search_supabase
        return similarity_search_supabase(query, k, score_threshold)
    
    # ChromaDB path
    vectorstore = get_vectorstore()
    k = k or settings.MAX_CONTEXT_DOCUMENTS
    threshold = score_threshold or settings.SIMILARITY_THRESHOLD
    
    results = vectorstore.similarity_search_with_relevance_scores(
        query, 
        k=k
    )
    
    # Filter by threshold and add score to metadata
    filtered_results = []
    for doc, score in results:
        if score >= threshold:
            doc.metadata['score'] = score
            filtered_results.append(doc)
    
    logger.info(f"Retrieved {len(filtered_results)} documents for query: {query[:50]}...")
    
    return filtered_results


def get_document_count() -> int:
    """
    Get the number of documents in the vector store.
    
    Returns:
        Document count
    """
    try:
        if is_using_supabase():
            from app.rag.supabase_vectorstore import get_document_count_supabase
            return get_document_count_supabase()
        else:
            vectorstore = get_vectorstore()
            collection = vectorstore._collection
            return collection.count()
    except Exception as e:
        logger.error(f"Error getting document count: {e}")
        return 0


def clear_vectorstore():
    """
    Clear all documents from the vector store.
    """
    global _vectorstore
    
    if is_using_supabase():
        from app.rag.supabase_vectorstore import clear_vectorstore_supabase
        clear_vectorstore_supabase()
    else:
        if _vectorstore is not None:
            _vectorstore.delete_collection()
            _vectorstore = None
            logger.info("ChromaDB vector store cleared")


def get_vectorstore_status() -> dict:
    """
    Get the current status of the vector store.
    
    Returns:
        Status dictionary with type, connection status, and document count
    """
    status = {
        "type": settings.VECTOR_STORE_TYPE,
        "connected": False,
        "document_count": 0
    }
    
    try:
        if is_using_supabase():
            from app.rag.supabase_vectorstore import check_supabase_connection
            status["connected"] = check_supabase_connection()
        else:
            get_vectorstore()
            status["connected"] = True
        
        if status["connected"]:
            status["document_count"] = get_document_count()
            
    except Exception as e:
        logger.error(f"Error getting vector store status: {e}")
        status["error"] = str(e)
    
    return status
