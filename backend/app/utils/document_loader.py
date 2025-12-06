"""
Document Loading Utilities for IFRS 17 RAG Chatbot
Simplified version using direct file reading to avoid complex dependencies.
"""
import os
import logging
from typing import List
from pathlib import Path
from langchain_core.documents import Document

from app.config import settings

logger = logging.getLogger(__name__)


def load_text_file(file_path: str) -> List[Document]:
    """Load any text-based file (txt, md, etc.)."""
    try:
        # Try multiple encodings
        content = None
        for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue
        
        if content is None:
            logger.error(f"Could not decode file {file_path}")
            return []
        
        doc = Document(
            page_content=content,
            metadata={
                "source": os.path.basename(file_path),
                "file_path": file_path
            }
        )
        
        logger.info(f"Loaded text file {file_path} ({len(content)} characters)")
        return [doc]
    except Exception as e:
        logger.error(f"Error loading text file {file_path}: {e}")
        return []


def load_pdf(file_path: str) -> List[Document]:
    """Load a PDF document using PyPDF2 if available."""
    try:
        # Try using pypdf
        from pypdf import PdfReader
        
        reader = PdfReader(file_path)
        documents = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text.strip():
                doc = Document(
                    page_content=text,
                    metadata={
                        "source": os.path.basename(file_path),
                        "page": i + 1,
                        "file_path": file_path
                    }
                )
                documents.append(doc)
        
        logger.info(f"Loaded {len(documents)} pages from PDF {file_path}")
        return documents
    except ImportError:
        logger.warning(f"pypdf not installed, skipping PDF: {file_path}")
        return []
    except Exception as e:
        logger.error(f"Error loading PDF {file_path}: {e}")
        return []


def load_documents(directory: str = None) -> List[Document]:
    """
    Load all supported documents from a directory.
    
    Args:
        directory: Path to document directory. Uses config default if not provided.
        
    Returns:
        List of loaded documents
    """
    directory = directory or settings.DOCS_DIRECTORY
    
    # Convert to absolute path if relative
    if not os.path.isabs(directory):
        directory = os.path.abspath(directory)
    
    logger.info(f"Looking for documents in: {directory}")
    
    if not os.path.exists(directory):
        logger.warning(f"Documents directory does not exist: {directory}")
        os.makedirs(directory, exist_ok=True)
        return []
    
    all_documents = []
    
    # Text-based file extensions
    text_extensions = {".md", ".txt", ".markdown"}
    pdf_extension = ".pdf"
    
    for file_path in Path(directory).rglob("*"):
        if file_path.is_file():
            ext = file_path.suffix.lower()
            
            # Skip README files
            if file_path.name.lower() == "readme.md":
                continue
                
            if ext in text_extensions:
                documents = load_text_file(str(file_path))
                all_documents.extend(documents)
            elif ext == pdf_extension:
                documents = load_pdf(str(file_path))
                all_documents.extend(documents)
    
    logger.info(f"Loaded {len(all_documents)} documents from {directory}")
    return all_documents
