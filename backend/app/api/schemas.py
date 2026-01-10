"""
Pydantic Schemas for API Request/Response Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    """Single chat message."""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class GameContext(BaseModel):
    """Current game context for contextual assistance."""
    current_module_index: Optional[int] = Field(None, description="Index of current module (0-based)")
    current_module_title: Optional[str] = Field(None, description="Title of current module")
    current_module_icon: Optional[str] = Field(None, description="Icon emoji for current module")
    current_question_index: Optional[int] = Field(None, description="Index of current question (0-based)")
    current_question_text: Optional[str] = Field(None, description="Current question being displayed")
    current_question_options: Optional[List[str]] = Field(None, description="Answer options for current question")
    current_question_explanation: Optional[str] = Field(None, description="Explanation for the correct answer")
    is_module_completed: bool = Field(False, description="Whether current module is completed")
    completed_modules: Optional[List[str]] = Field(None, description="List of completed module titles")
    user_level: Optional[int] = Field(None, description="User's current level")
    total_score: Optional[int] = Field(None, description="User's total score")


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., description="User's question about IFRS 17")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for context")
    include_sources: bool = Field(True, description="Whether to include source documents in response")
    chat_history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Previous messages in the conversation for context")
    game_context: Optional[GameContext] = Field(None, description="Current game state for contextual responses")


class SourceDocument(BaseModel):
    """Source document reference."""
    content: str = Field(..., description="Relevant text excerpt")
    source: str = Field(..., description="Document source/filename")
    page: Optional[int] = Field(None, description="Page number if applicable")
    relevance_score: Optional[float] = Field(None, description="Similarity score")


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    answer: str = Field(..., description="AI-generated answer")
    sources: List[SourceDocument] = Field(default_factory=list, description="Source documents used")
    conversation_id: str = Field(..., description="Conversation ID for follow-up questions")
    processing_time: float = Field(..., description="Time taken to generate response in seconds")


class IngestRequest(BaseModel):
    """Request model for document ingestion."""
    document_path: Optional[str] = Field(None, description="Path to specific document to ingest")
    refresh_all: bool = Field(False, description="Whether to refresh all documents")


class IngestResponse(BaseModel):
    """Response model for document ingestion."""
    success: bool
    documents_processed: int
    chunks_created: int
    message: str


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    version: str
    vector_store_ready: bool
    documents_count: int
    vector_store_type: Optional[str] = Field(None, description="Type of vector store (supabase or chroma)")
