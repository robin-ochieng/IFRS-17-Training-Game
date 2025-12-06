"""
LangGraph Workflow Definition for IFRS 17 RAG Chatbot
"""
import logging
from typing import Dict, Any
from langgraph.graph import StateGraph, END

from app.core.state import GraphState
from app.core.nodes import (
    guardrail_agent,
    classify_query,
    retrieve_documents,
    generate_answer,
    format_response
)

logger = logging.getLogger(__name__)


def create_rag_graph() -> StateGraph:
    """
    Create the LangGraph workflow for RAG-based Q&A.
    
    Workflow:
    1. guardrail_agent - Validate if query is IFRS 17 related
    2. classify_query - Determine if retrieval is needed
    3. retrieve_documents - Get relevant documents from vector store
    4. generate_answer - Generate answer using LLM with context
    5. format_response - Format the final response with sources
    
    Graph Structure:
    
        [START]
           │
           ▼
    ┌────────────────┐
    │guardrail_agent │  ← Validates IFRS 17 relevance
    └──────┬─────────┘
           │
           ▼
    ┌──────────────┐
    │classify_query│
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │retrieve_documents│
    └──────┬───────────┘
           │
           ▼
    ┌───────────────┐
    │generate_answer│
    └──────┬────────┘
           │
           ▼
    ┌───────────────┐
    │format_response│
    └──────┬────────┘
           │
           ▼
         [END]
    """
    
    # Create the graph
    workflow = StateGraph(GraphState)
    
    # Add nodes
    workflow.add_node("guardrail_agent", guardrail_agent)
    workflow.add_node("classify_query", classify_query)
    workflow.add_node("retrieve_documents", retrieve_documents)
    workflow.add_node("generate_answer", generate_answer)
    workflow.add_node("format_response", format_response)
    
    # Define edges
    workflow.set_entry_point("guardrail_agent")
    workflow.add_edge("guardrail_agent", "classify_query")
    workflow.add_edge("classify_query", "retrieve_documents")
    workflow.add_edge("retrieve_documents", "generate_answer")
    workflow.add_edge("generate_answer", "format_response")
    workflow.add_edge("format_response", END)
    
    return workflow.compile()


# Create the compiled graph
rag_graph = create_rag_graph()


async def process_query(question: str, conversation_id: str, chat_history: list = None) -> Dict[str, Any]:
    """
    Process a user query through the RAG pipeline.
    
    Args:
        question: The user's question
        conversation_id: Unique conversation identifier
        chat_history: Previous conversation messages
        
    Returns:
        Dict containing answer, sources, and updated chat history
    """
    initial_state = {
        "question": question,
        "conversation_id": conversation_id,
        "chat_history": chat_history or [],
        "retrieved_documents": [],
        "context": "",
        "should_search": True,
        "answer": "",
        "sources": [],
        "error": None
    }
    
    try:
        result = await rag_graph.ainvoke(initial_state)
        return {
            "answer": result["answer"],
            "sources": result["sources"],
            "chat_history": result["chat_history"],
            "conversation_id": conversation_id
        }
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return {
            "answer": f"I apologize, but I encountered an error processing your question. Please try again.",
            "sources": [],
            "chat_history": chat_history or [],
            "conversation_id": conversation_id,
            "error": str(e)
        }
