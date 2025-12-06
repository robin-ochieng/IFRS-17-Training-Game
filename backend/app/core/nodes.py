"""
LangGraph Node Functions for IFRS 17 RAG Workflow
"""
import logging
import json
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.core.state import GraphState
from app.rag.vectorstore import similarity_search, get_document_count
from app.config import settings

logger = logging.getLogger(__name__)

# Off-topic response message
OFF_TOPIC_RESPONSE = """I appreciate your question, but I'm specifically designed to assist only with **IFRS 17 (Insurance Contracts)** related topics.

I can help you with questions about:
- **Measurement models** (GMM, PAA, VFA)
- **Contract boundaries and grouping**
- **Liability for Remaining Coverage (LRC)**
- **Liability for Incurred Claims (LIC)**
- **Contractual Service Margin (CSM)**
- **Risk adjustment calculations**
- **Insurance revenue recognition**
- **Reinsurance contracts**
- **Transition requirements**
- **Disclosure requirements**

Please ask me something related to IFRS 17, and I'll be happy to help!"""


async def guardrail_agent(state: GraphState) -> Dict[str, Any]:
    """
    Guardrail agent that validates if the query is related to IFRS 17.
    
    Uses an LLM to determine if the question is about IFRS 17 or insurance accounting.
    Also detects simple greetings that should be handled specially.
    """
    question = state["question"].strip()
    question_lower = question.lower()
    
    # Quick check for simple greetings (no need for LLM)
    simple_greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "thanks", "thank you", "bye", "goodbye"]
    is_only_greeting = any(
        question_lower.strip().strip('!.,?') == greeting 
        for greeting in simple_greetings
    )
    
    if is_only_greeting:
        return {
            "is_ifrs17_related": True,  # Allow greetings to pass through
            "is_greeting": True,
            "should_search": False
        }
    
    # Quick check: if the question contains "IFRS 17" or "IFRS17", it's always related
    if "ifrs 17" in question_lower or "ifrs17" in question_lower:
        logger.info(f"Query contains 'IFRS 17' - auto-approved: {question[:50]}...")
        return {
            "is_ifrs17_related": True,
            "is_greeting": False,
            "should_search": True
        }
    
    try:
        # Use LLM to classify the query
        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0,
            api_key=settings.OPENAI_API_KEY
        )
        
        classification_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a topic classifier for an IFRS 17 (Insurance Contracts) assistant.

Your job is to determine if a user's question is related to IFRS 17 or insurance accounting. Be INCLUSIVE - if the question mentions IFRS 17 or asks about whether something falls under IFRS 17, it IS related.

IFRS 17 related topics include:
- Insurance contracts and their measurement
- General Measurement Model (GMM), Premium Allocation Approach (PAA), Variable Fee Approach (VFA)
- Contract boundaries, grouping, and portfolios
- Liability for Remaining Coverage (LRC) and Liability for Incurred Claims (LIC)
- Contractual Service Margin (CSM)
- Risk adjustment for non-financial risk
- Insurance revenue and expense recognition
- Reinsurance contracts held and issued
- Investment contracts with discretionary participation features
- Transition requirements from IFRS 4
- Disclosure and presentation requirements
- Insurance finance income and expenses
- Onerous contracts
- Any general questions about IFRS 17 standard
- Insurance accounting practices related to IFRS 17
- Comparisons between IFRS 17 and other standards (IFRS 4, IFRS 16, US GAAP, etc.)
- Questions about IFRS 17 SCOPE (what contracts are covered or excluded)
- Questions asking if specific contracts (leases, warranties, financial guarantees, etc.) fall under IFRS 17
- Questions about exclusions from IFRS 17
- Questions about embedded derivatives in insurance contracts
- Any question that explicitly mentions "IFRS 17" or "IFRS17"

NOT IFRS 17 related:
- General programming questions (unless about implementing IFRS 17)
- Topics completely unrelated to accounting or insurance
- General knowledge questions (weather, sports, entertainment, etc.)
- Personal advice unrelated to insurance accounting

IMPORTANT: If the question contains "IFRS 17" or "IFRS17", it is ALWAYS related - answer "true".

Respond with ONLY the word "true" if the question is IFRS 17 related, or "false" if it is not.
Do not include any other text, explanation, or formatting in your response."""),
            ("human", "Classify this query: {question}")
        ])
        
        chain = classification_prompt | llm
        response = await chain.ainvoke({"question": question})
        
        # Parse the response - should be "true" or "false"
        result_text = response.content.strip().lower()
        is_related = result_text == "true"
        
        logger.info(f"Query classification - IFRS17 related: {is_related} - Question: {question[:50]}...")
        
        return {
            "is_ifrs17_related": is_related,
            "is_greeting": False,
            "should_search": is_related  # Only search if IFRS 17 related
        }
        
    except Exception as e:
        logger.error(f"Error in guardrail agent: {e}")
        # On error, be permissive and allow the query
        return {
            "is_ifrs17_related": True,
            "is_greeting": False,
            "should_search": True
        }


async def classify_query(state: GraphState) -> Dict[str, Any]:
    """
    Secondary classification for queries that passed the guardrail.
    Determines if document retrieval is needed.
    """
    # If already classified as off-topic, skip
    if not state.get("is_ifrs17_related", True):
        return {"should_search": False}
    
    # If it's a greeting, no search needed
    if state.get("is_greeting", False):
        return {"should_search": False}
    
    # Check if vector store has documents
    doc_count = get_document_count()
    
    return {
        "should_search": doc_count > 0
    }


async def retrieve_documents(state: GraphState) -> Dict[str, Any]:
    """
    Retrieve relevant documents from the vector store.
    """
    if not state.get("should_search", True):
        return {
            "retrieved_documents": [],
            "context": ""
        }
    
    question = state["question"]
    
    try:
        # Retrieve documents from ChromaDB
        documents = similarity_search(
            query=question,
            k=settings.MAX_CONTEXT_DOCUMENTS,
            score_threshold=settings.SIMILARITY_THRESHOLD
        )
        
        if not documents:
            logger.info(f"No relevant documents found for: {question}")
            return {
                "retrieved_documents": [],
                "context": "No relevant documentation found for this query."
            }
        
        # Build context from retrieved documents
        context_parts = []
        retrieved_docs = []
        
        for i, doc in enumerate(documents, 1):
            context_parts.append(f"[Document {i}]\n{doc.page_content}")
            retrieved_docs.append({
                "content": doc.page_content,
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page"),
                "relevance_score": doc.metadata.get("score", 0.0)
            })
        
        context = "\n\n---\n\n".join(context_parts)
        logger.info(f"Retrieved {len(documents)} documents for query")
        
        return {
            "retrieved_documents": retrieved_docs,
            "context": context
        }
        
    except Exception as e:
        logger.error(f"Error retrieving documents: {e}")
        return {
            "retrieved_documents": [],
            "context": ""
        }


async def generate_answer(state: GraphState) -> Dict[str, Any]:
    """
    Generate an answer using the LLM with retrieved context.
    """
    question = state["question"]
    context = state.get("context", "")
    chat_history = state.get("chat_history", [])
    
    # Handle off-topic queries (not IFRS 17 related)
    if not state.get("is_ifrs17_related", True):
        return {
            "answer": OFF_TOPIC_RESPONSE,
            "chat_history": chat_history + [
                {"role": "user", "content": question},
                {"role": "assistant", "content": OFF_TOPIC_RESPONSE}
            ]
        }
    
    # Handle greetings
    if state.get("is_greeting", False):
        answer = "Hello! I'm the IFRS 17 Assistant. I can help you understand the insurance accounting standard, including concepts like measurement models, contract boundaries, liability calculations, and more. What would you like to know about IFRS 17?"
        return {
            "answer": answer,
            "chat_history": chat_history + [
                {"role": "user", "content": question},
                {"role": "assistant", "content": answer}
            ]
        }
    
    try:
        # Create LLM instance
        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.1,
            api_key=settings.OPENAI_API_KEY
        )
        
        # Create RAG prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert IFRS 17 (Insurance Contracts) assistant. Your role is to help users understand the insurance accounting standard by providing accurate, clear explanations based on the provided context.

Guidelines:
- Base your answers primarily on the provided context
- Be specific and cite relevant concepts from IFRS 17
- If the context doesn't contain enough information, say so clearly
- Use professional but accessible language
- Structure your answers with headers and bullet points when appropriate
- Explain technical terms when first introduced

Context from IFRS 17 documentation:
{context}"""),
            ("human", "{question}")
        ])
        
        # Generate response
        chain = prompt | llm
        response = await chain.ainvoke({
            "context": context if context else "No specific documentation available for this query.",
            "question": question
        })
        
        answer = response.content
        
        return {
            "answer": answer,
            "chat_history": chat_history + [
                {"role": "user", "content": question},
                {"role": "assistant", "content": answer}
            ]
        }
        
    except Exception as e:
        logger.error(f"Error generating answer: {e}")
        return {
            "answer": f"I apologize, but I encountered an error while generating a response. Please try again or rephrase your question.",
            "chat_history": chat_history
        }


async def format_response(state: GraphState) -> Dict[str, Any]:
    """
    Format the final response with sources.
    """
    sources = []
    for doc in state.get("retrieved_documents", []):
        sources.append({
            "content": doc.get("content", "")[:200] + "...",
            "source": doc.get("source", "Unknown"),
            "page": doc.get("page"),
            "relevance_score": doc.get("relevance_score", 0.0)
        })
    
    return {
        "sources": sources
    }
