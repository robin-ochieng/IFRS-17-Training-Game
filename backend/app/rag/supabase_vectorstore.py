"""
Supabase pgvector implementation for IFRS 17 RAG Chatbot.
Provides persistent vector storage that survives deployments.
"""
import logging
from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from langsmith import traceable

from app.config import settings
from app.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)

# Global Supabase client instance
_supabase_client = None


def get_supabase_client():
    """
    Get or create the Supabase client instance.
    
    Returns:
        Supabase client
    """
    global _supabase_client
    
    if _supabase_client is None:
        from supabase import create_client
        
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables"
            )
        
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
        logger.info("Supabase client initialized")
    
    return _supabase_client


def add_documents_supabase(documents: List[Document], batch_size: int = 50) -> int:
    """
    Add documents with embeddings to Supabase pgvector.
    
    Args:
        documents: List of LangChain Document objects to add
        batch_size: Number of documents to insert per batch
        
    Returns:
        Number of documents added
    """
    if not documents:
        return 0
    
    client = get_supabase_client()
    embeddings = get_embeddings()
    total_added = 0
    
    # Process in batches
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        
        # Extract texts and generate embeddings
        texts = [doc.page_content for doc in batch]
        embedding_vectors = embeddings.embed_documents(texts)
        
        # Prepare records for insertion
        records = []
        for doc, embedding in zip(batch, embedding_vectors):
            records.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "embedding": embedding
            })
        
        # Insert into Supabase
        try:
            result = client.table("documents").insert(records).execute()
            batch_count = len(result.data) if result.data else 0
            total_added += batch_count
            logger.info(f"Inserted batch {i // batch_size + 1}: {batch_count} documents")
        except Exception as e:
            logger.error(f"Error inserting batch: {e}")
            raise
    
    logger.info(f"Total documents added to Supabase: {total_added}")
    return total_added


@traceable(name="supabase_similarity_search", run_type="retriever")
def similarity_search_supabase(
    query: str,
    k: int = None,
    score_threshold: float = None
) -> List[Document]:
    """
    Search for similar documents using Supabase pgvector.
    
    Args:
        query: Search query text
        k: Number of results to return
        score_threshold: Minimum similarity threshold (0-1)
        
    Returns:
        List of matching LangChain Document objects with scores in metadata
    """
    client = get_supabase_client()
    embeddings = get_embeddings()
    
    k = k or settings.MAX_CONTEXT_DOCUMENTS
    threshold = score_threshold or settings.SIMILARITY_THRESHOLD
    
    # Generate query embedding
    query_embedding = embeddings.embed_query(query)
    
    # Call the match_documents function in Supabase
    try:
        result = client.rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": k
            }
        ).execute()
        
        # Convert to LangChain Documents
        documents = []
        for row in result.data:
            metadata = row.get("metadata", {})
            metadata["score"] = row.get("similarity", 0.0)
            
            doc = Document(
                page_content=row["content"],
                metadata=metadata
            )
            documents.append(doc)
        
        logger.info(f"Retrieved {len(documents)} documents from Supabase for query: {query[:50]}...")
        return documents
        
    except Exception as e:
        logger.error(f"Error searching Supabase: {e}")
        raise


def get_document_count_supabase() -> int:
    """
    Get the number of documents in Supabase.
    
    Returns:
        Document count
    """
    try:
        client = get_supabase_client()
        result = client.table("documents").select("id", count="exact").execute()
        return result.count or 0
    except Exception as e:
        logger.error(f"Error getting document count from Supabase: {e}")
        return 0


def clear_vectorstore_supabase():
    """
    Clear all documents from Supabase pgvector.
    """
    try:
        client = get_supabase_client()
        # Delete all documents (using a condition that matches all)
        client.table("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        logger.info("Supabase vector store cleared")
    except Exception as e:
        logger.error(f"Error clearing Supabase vector store: {e}")
        raise


def check_supabase_connection() -> bool:
    """
    Check if Supabase connection is working.
    
    Returns:
        True if connection is successful
    """
    try:
        client = get_supabase_client()
        # Try to query the documents table
        client.table("documents").select("id").limit(1).execute()
        return True
    except Exception as e:
        logger.error(f"Supabase connection check failed: {e}")
        return False
