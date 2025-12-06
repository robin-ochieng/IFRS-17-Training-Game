"""
Embedding Generation for IFRS 17 RAG Chatbot
"""
from langchain_openai import OpenAIEmbeddings
from app.config import settings


def get_embeddings():
    """
    Get the embedding model for document and query encoding.
    
    Returns:
        OpenAIEmbeddings instance configured with API key
    """
    return OpenAIEmbeddings(
        openai_api_key=settings.OPENAI_API_KEY,
        model="text-embedding-3-small"  # Cost-effective and high quality
    )
