"""
Text Splitting Utilities for IFRS 17 RAG Chatbot
"""
import logging
from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.config import settings

logger = logging.getLogger(__name__)


def get_text_splitter() -> RecursiveCharacterTextSplitter:
    """
    Get configured text splitter for chunking documents.
    
    Returns:
        Configured RecursiveCharacterTextSplitter
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )


def split_documents(documents: List[Document]) -> List[Document]:
    """
    Split documents into smaller chunks for embedding.
    
    Args:
        documents: List of documents to split
        
    Returns:
        List of document chunks
    """
    if not documents:
        return []
    
    splitter = get_text_splitter()
    chunks = splitter.split_documents(documents)
    
    logger.info(f"Split {len(documents)} documents into {len(chunks)} chunks")
    return chunks
