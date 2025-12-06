"""
LangGraph State Definition for IFRS 17 RAG Chatbot
"""
from typing import TypedDict, List, Optional, Annotated
from operator import add


class DocumentChunk(TypedDict):
    """Represents a chunk of retrieved document."""
    content: str
    source: str
    page: Optional[int]
    relevance_score: float


class GraphState(TypedDict):
    """
    State definition for the LangGraph RAG workflow.
    
    Attributes:
        question: The user's input question
        conversation_id: Unique identifier for the conversation
        chat_history: List of previous messages in the conversation
        retrieved_documents: Documents retrieved from vector store
        context: Formatted context from retrieved documents
        answer: The generated answer
        sources: Source references for the answer
        should_search: Whether to perform document search
        is_ifrs17_related: Whether the query is related to IFRS 17
        is_greeting: Whether the query is a simple greeting
        error: Any error that occurred during processing
    """
    # Input
    question: str
    conversation_id: str
    
    # Conversation context
    chat_history: Annotated[List[dict], add]
    
    # Retrieval
    retrieved_documents: List[DocumentChunk]
    context: str
    should_search: bool
    
    # Topic guardrail
    is_ifrs17_related: bool
    is_greeting: bool
    
    # Output
    answer: str
    sources: List[dict]
    
    # Error handling
    error: Optional[str]
