"""
Vector Store Management for IFRS 17 RAG Chatbot
"""
import os
import logging
from typing import List, Optional
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langsmith import traceable

from app.config import settings
from app.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)

# Global vector store instance
_vectorstore: Optional[Chroma] = None


def get_vectorstore() -> Chroma:
    """
    Get or create the vector store instance.
    
    Returns:
        Chroma vector store instance
    """
    global _vectorstore
    
    if _vectorstore is None:
        embeddings = get_embeddings()
        persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        
        # Ensure directory exists
        os.makedirs(persist_directory, exist_ok=True)
        
        _vectorstore = Chroma(
            collection_name="ifrs17_documents",
            embedding_function=embeddings,
            persist_directory=persist_directory
        )
        logger.info(f"Vector store initialized at {persist_directory}")
    
    return _vectorstore


def add_documents(documents: List[Document]) -> int:
    """
    Add documents to the vector store.
    
    Args:
        documents: List of Document objects to add
        
    Returns:
        Number of documents added
    """
    vectorstore = get_vectorstore()
    
    if not documents:
        return 0
    
    vectorstore.add_documents(documents)
    logger.info(f"Added {len(documents)} documents to vector store")
    
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
    
    if _vectorstore is not None:
        _vectorstore.delete_collection()
        _vectorstore = None
        logger.info("Vector store cleared")
