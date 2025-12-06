"""
Document Retrieval for IFRS 17 RAG Chatbot
"""
import logging
from typing import List, Dict, Any
from app.rag.vectorstore import similarity_search
from app.config import settings

logger = logging.getLogger(__name__)


async def retrieve(
    query: str,
    k: int = None,
    include_metadata: bool = True
) -> List[Dict[str, Any]]:
    """
    Retrieve relevant documents for a query.
    
    Args:
        query: The search query
        k: Number of documents to retrieve
        include_metadata: Whether to include document metadata
        
    Returns:
        List of document dictionaries with content and metadata
    """
    k = k or settings.MAX_CONTEXT_DOCUMENTS
    
    try:
        documents = await similarity_search(query, k=k)
        
        results = []
        for doc in documents:
            result = {
                "content": doc.page_content,
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page"),
                "relevance_score": doc.metadata.get("score", 0.0)
            }
            results.append(result)
        
        logger.info(f"Retrieved {len(results)} documents for query: {query[:50]}...")
        return results
        
    except Exception as e:
        logger.error(f"Error retrieving documents: {e}")
        return []


def format_context(documents: List[Dict[str, Any]]) -> str:
    """
    Format retrieved documents into a context string for the LLM.
    
    Args:
        documents: List of retrieved document dictionaries
        
    Returns:
        Formatted context string
    """
    if not documents:
        return "No relevant documents found."
    
    context_parts = []
    for i, doc in enumerate(documents, 1):
        source_info = f"[Source: {doc['source']}"
        if doc.get('page'):
            source_info += f", Page {doc['page']}"
        source_info += "]"
        
        context_parts.append(f"""
---
Document {i} {source_info}:
{doc['content']}
---
""")
    
    return "\n".join(context_parts)
