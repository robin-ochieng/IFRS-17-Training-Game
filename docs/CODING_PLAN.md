# IFRS 17 RAG Chatbot - Comprehensive Coding Plan

## Overview

This document provides a detailed, phase-by-phase coding plan for implementing the IFRS 17 RAG Chatbot. Each phase includes specific tasks, code locations, dependencies, and acceptance criteria.

---

# Phase 1: Backend Foundation & Core Infrastructure

**Duration:** 3-4 days  
**Goal:** Establish a working FastAPI server with basic endpoints and configuration

---

## Task 1.1: Environment Configuration

**File:** `backend/app/config.py`

**Objective:** Create robust configuration management with validation

**Code Tasks:**
```python
# 1. Add pydantic-settings to requirements.txt (DONE)
# 2. Create Settings class with all environment variables
# 3. Add validation for required fields (OPENAI_API_KEY)
# 4. Create settings singleton for app-wide access
```

**Acceptance Criteria:**
- [ ] Settings load from `.env` file
- [ ] Missing required keys raise clear errors
- [ ] All config values accessible via `settings.VARIABLE_NAME`

---

## Task 1.2: FastAPI Application Setup

**File:** `backend/app/main.py`

**Objective:** Configure FastAPI with middleware, CORS, and lifespan events

**Code Tasks:**
```python
# 1. Create FastAPI app with metadata
# 2. Configure CORS middleware for frontend origins
# 3. Set up lifespan context manager for startup/shutdown
# 4. Include API router with /api prefix
# 5. Add root endpoint for API info
```

**Acceptance Criteria:**
- [ ] Server starts without errors on `uvicorn app.main:app`
- [ ] CORS allows requests from `http://localhost:3000`
- [ ] `/docs` shows Swagger UI
- [ ] `/` returns API info JSON

---

## Task 1.3: API Schema Definitions

**File:** `backend/app/api/schemas.py`

**Objective:** Define Pydantic models for request/response validation

**Code Tasks:**
```python
# Models to create:
# 1. ChatMessage - role, content, timestamp
# 2. ChatRequest - message, conversation_id, include_sources
# 3. SourceDocument - content, source, page, relevance_score
# 4. ChatResponse - answer, sources, conversation_id, processing_time
# 5. IngestRequest - document_path, refresh_all
# 6. IngestResponse - success, documents_processed, chunks_created, message
# 7. HealthResponse - status, version, vector_store_ready, documents_count
```

**Acceptance Criteria:**
- [ ] All models have proper type hints
- [ ] Field descriptions for API documentation
- [ ] Default values where appropriate

---

## Task 1.4: API Route Implementation

**File:** `backend/app/api/routes.py`

**Objective:** Create placeholder endpoints that return valid responses

**Code Tasks:**
```python
# Endpoints to implement:
# 1. GET /api/health - Return health status
# 2. POST /api/chat - Accept message, return placeholder response
# 3. POST /api/ingest - Accept ingestion request, return placeholder
```

**Acceptance Criteria:**
- [ ] All endpoints return 200 status codes
- [ ] Response bodies match schema definitions
- [ ] Error handling returns proper HTTP status codes

---

## Task 1.5: Logging Configuration

**File:** `backend/app/main.py` (extend)

**Objective:** Set up structured logging for debugging

**Code Tasks:**
```python
# 1. Configure logging format with timestamp, level, message
# 2. Set log level from environment variable
# 3. Add request/response logging middleware (optional)
```

**Acceptance Criteria:**
- [ ] Logs appear in console with timestamps
- [ ] Log level configurable via `LOG_LEVEL` env var
- [ ] API requests logged with path and status

---

# Phase 2: Document Processing & Vector Store

**Duration:** 4-5 days  
**Goal:** Ingest IFRS 17 documents into ChromaDB for retrieval

---

## Task 2.1: Document Loader Implementation

**File:** `backend/app/utils/document_loader.py`

**Objective:** Load PDF, TXT, and DOCX files from the documents directory

**Code Tasks:**
```python
# 1. Implement load_pdf() using PyPDFLoader
#    - Extract text from each page
#    - Preserve page numbers in metadata
#    - Handle multi-column layouts

# 2. Implement load_text() using TextLoader
#    - Handle different encodings (UTF-8, Latin-1)

# 3. Implement load_word() using UnstructuredWordDocumentLoader
#    - Extract text while preserving structure

# 4. Implement load_documents() master function
#    - Scan directory recursively
#    - Route to appropriate loader by extension
#    - Aggregate all documents
```

**Acceptance Criteria:**
- [ ] Successfully loads the IFRS 17 PDF (100+ pages)
- [ ] Each document chunk has source and page metadata
- [ ] Handles missing directory gracefully
- [ ] Returns empty list if no documents found

---

## Task 2.2: Text Splitter Configuration

**File:** `backend/app/utils/text_splitter.py`

**Objective:** Split documents into optimal chunks for embedding

**Code Tasks:**
```python
# 1. Create RecursiveCharacterTextSplitter with:
#    - chunk_size: 1000 characters
#    - chunk_overlap: 200 characters
#    - Separators: ["\n\n", "\n", ". ", " ", ""]

# 2. Implement split_documents() function
#    - Accept list of documents
#    - Return list of chunks with preserved metadata

# 3. Add chunk metadata enrichment
#    - Add chunk_index to metadata
#    - Preserve original source and page
```

**Acceptance Criteria:**
- [ ] Chunks are ~1000 characters (±10%)
- [ ] Overlap ensures context continuity
- [ ] Metadata preserved through splitting
- [ ] No empty or whitespace-only chunks

---

## Task 2.3: Embedding Generation

**File:** `backend/app/rag/embeddings.py`

**Objective:** Configure OpenAI embeddings for document encoding

**Code Tasks:**
```python
# 1. Create get_embeddings() function
#    - Use OpenAIEmbeddings from langchain_openai
#    - Model: text-embedding-3-small (cost-effective)
#    - Read API key from settings

# 2. Add embedding caching (optional optimization)
#    - Cache embeddings to avoid re-computation
```

**Acceptance Criteria:**
- [ ] Embeddings generate without API errors
- [ ] Consistent embedding dimension (1536 for OpenAI)
- [ ] Handles rate limiting gracefully

---

## Task 2.4: Vector Store Setup

**File:** `backend/app/rag/vectorstore.py`

**Objective:** Initialize and manage ChromaDB for document storage

**Code Tasks:**
```python
# 1. Implement get_vectorstore() singleton
#    - Create ChromaDB client
#    - Use persistent directory from settings
#    - Create collection "ifrs17_documents"

# 2. Implement add_documents()
#    - Accept list of Document objects
#    - Add to vector store with embeddings
#    - Return count of documents added

# 3. Implement similarity_search()
#    - Accept query string
#    - Return top-k documents with scores
#    - Filter by relevance threshold

# 4. Implement get_document_count()
#    - Return total documents in store

# 5. Implement clear_vectorstore()
#    - Delete all documents (for refresh)
```

**Acceptance Criteria:**
- [ ] Vector store persists to `data/chroma_db/`
- [ ] Documents retrievable after server restart
- [ ] Similarity search returns relevant chunks
- [ ] Document count accurate

---

## Task 2.5: Ingestion Pipeline

**File:** `backend/app/api/routes.py` (extend ingest endpoint)

**Objective:** Complete the document ingestion workflow

**Code Tasks:**
```python
# Update POST /api/ingest to:
# 1. Load documents from directory
# 2. Split into chunks
# 3. Add to vector store
# 4. Return statistics

# Add error handling for:
# - No documents found
# - Invalid file formats
# - Embedding API failures
```

**Acceptance Criteria:**
- [ ] Ingest endpoint processes all documents in folder
- [ ] Returns accurate count of processed documents
- [ ] Handles partial failures (some docs fail, others succeed)
- [ ] refresh_all clears existing documents first

---

# Phase 3: LangGraph RAG Workflow

**Duration:** 5-6 days  
**Goal:** Build the complete RAG pipeline with LangGraph

---

## Task 3.1: Graph State Definition

**File:** `backend/app/core/state.py`

**Objective:** Define the state schema for the LangGraph workflow

**Code Tasks:**
```python
# 1. Create DocumentChunk TypedDict
#    - content: str
#    - source: str
#    - page: Optional[int]
#    - relevance_score: float

# 2. Create GraphState TypedDict
#    - question: str
#    - conversation_id: str
#    - chat_history: Annotated[List[dict], add]
#    - retrieved_documents: List[DocumentChunk]
#    - context: str
#    - should_search: bool
#    - answer: str
#    - sources: List[dict]
#    - error: Optional[str]
```

**Acceptance Criteria:**
- [ ] State type-checks correctly with mypy
- [ ] Annotated fields work with LangGraph reducers
- [ ] All necessary fields for RAG workflow present

---

## Task 3.2: Query Classification Node

**File:** `backend/app/core/nodes.py`

**Objective:** Determine if a query needs document retrieval

**Code Tasks:**
```python
# Implement classify_query() node:
# 1. Check for greetings (hello, hi, hey)
# 2. Check for off-topic queries
# 3. Determine should_search boolean
# 4. Optional: Use LLM for smarter classification

# Classification logic:
# - Greetings → should_search = False
# - IFRS 17 keywords → should_search = True
# - Ambiguous → should_search = True (default)
```

**Acceptance Criteria:**
- [ ] "Hello" returns should_search = False
- [ ] "What is CSM?" returns should_search = True
- [ ] Fast execution (<100ms)

---

## Task 3.3: Document Retrieval Node

**File:** `backend/app/core/nodes.py` (extend)

**Objective:** Retrieve relevant documents from vector store

**Code Tasks:**
```python
# Implement retrieve_documents() node:
# 1. Check should_search flag
# 2. If False, return empty context
# 3. If True, query vector store
# 4. Format retrieved chunks into context string
# 5. Store chunks in retrieved_documents

# Context formatting:
# - Include source and page references
# - Limit to MAX_CONTEXT_DOCUMENTS chunks
# - Order by relevance score
```

**Acceptance Criteria:**
- [ ] Returns top-k relevant documents
- [ ] Context formatted with source citations
- [ ] Handles empty results gracefully
- [ ] Respects should_search flag

---

## Task 3.4: Answer Generation Node

**File:** `backend/app/core/nodes.py` (extend)

**Objective:** Generate answers using GPT-4 with context

**Code Tasks:**
```python
# Implement generate_answer() node:
# 1. Build prompt with system message, context, and question
# 2. Include chat history for multi-turn conversations
# 3. Call OpenAI GPT-4 Turbo
# 4. Parse response and update state

# System prompt:
"""
You are an expert IFRS 17 assistant. Answer questions about 
insurance accounting standards based on the provided context.

Rules:
- Base answers on the context provided
- If unsure, say so rather than guessing
- Reference specific sections when possible
- Keep answers clear and professional
"""
```

**Acceptance Criteria:**
- [ ] Answers are grounded in retrieved context
- [ ] Professional tone matching the domain
- [ ] Handles missing context with appropriate response
- [ ] Multi-turn conversation maintains context

---

## Task 3.5: Response Formatting Node

**File:** `backend/app/core/nodes.py` (extend)

**Objective:** Format the final response with source citations

**Code Tasks:**
```python
# Implement format_response() node:
# 1. Extract sources from retrieved_documents
# 2. Format source citations (document name, page)
# 3. Truncate long excerpts for display
# 4. Calculate relevance scores

# Output structure:
# sources: [
#   {
#     content: "Excerpt from document...",
#     source: "ifrs-17-insurance-contracts.pdf",
#     page: 24,
#     relevance_score: 0.92
#   }
# ]
```

**Acceptance Criteria:**
- [ ] Sources include document name and page
- [ ] Content excerpts are reasonably sized
- [ ] Relevance scores normalized 0-1

---

## Task 3.6: Graph Compilation

**File:** `backend/app/core/graph.py`

**Objective:** Assemble nodes into complete LangGraph workflow

**Code Tasks:**
```python
# 1. Create StateGraph with GraphState
# 2. Add all nodes:
#    - classify_query
#    - retrieve_documents
#    - generate_answer
#    - format_response

# 3. Define edges:
#    START → classify_query
#    classify_query → retrieve_documents
#    retrieve_documents → generate_answer
#    generate_answer → format_response
#    format_response → END

# 4. Compile graph
# 5. Create process_query() wrapper function
```

**Acceptance Criteria:**
- [ ] Graph compiles without errors
- [ ] process_query() returns complete response
- [ ] Error handling at each node
- [ ] Async execution works correctly

---

## Task 3.7: Chat Endpoint Integration

**File:** `backend/app/api/routes.py` (extend chat endpoint)

**Objective:** Connect the LangGraph workflow to the API

**Code Tasks:**
```python
# Update POST /api/chat:
# 1. Import process_query from graph
# 2. Call workflow with user message
# 3. Map workflow output to ChatResponse schema
# 4. Handle errors and timeouts

# Add:
# - Request timing
# - Error logging
# - Conversation ID generation
```

**Acceptance Criteria:**
- [ ] Chat endpoint returns RAG-powered responses
- [ ] Processing time tracked and returned
- [ ] Errors return 500 with helpful message
- [ ] Concurrent requests handled correctly

---

# Phase 4: Frontend Chat Panel

**Duration:** 4-5 days  
**Goal:** Build the complete chat UI component

---

## Task 4.1: Chat Service Layer

**File:** `src/services/chatbotService.js` (new)

**Objective:** Create API client for backend communication

**Code Tasks:**
```javascript
// 1. Create sendMessage(message, conversationId)
//    - POST to /api/chat
//    - Handle response parsing
//    - Error handling

// 2. Create checkHealth()
//    - GET /api/health
//    - Return status

// 3. Add request timeout handling
// 4. Add retry logic for failed requests
```

**Acceptance Criteria:**
- [ ] Successfully communicates with backend
- [ ] Handles network errors gracefully
- [ ] Returns typed response objects

---

## Task 4.2: Chat Panel Component

**File:** `src/components/ChatbotPanel.js` (new)

**Objective:** Create the main chat interface panel

**Code Tasks:**
```jsx
// Component structure:
// <ChatbotPanel>
//   <Header>
//     <Title>IFRS 17 Assistant</Title>
//     <CloseButton />
//   </Header>
//   <MessageList>
//     <Message role="user" />
//     <Message role="assistant" />
//   </MessageList>
//   <SourcesPanel /> (collapsible)
//   <InputArea>
//     <TextInput />
//     <SendButton />
//   </InputArea>
// </ChatbotPanel>

// Features:
// - Slide-in animation from right
// - Auto-scroll to latest message
// - Loading state with typing indicator
// - Responsive width (full on mobile)
```

**Acceptance Criteria:**
- [ ] Opens/closes smoothly
- [ ] Messages display correctly
- [ ] Input sends message on Enter
- [ ] Loading state visible during API call

---

## Task 4.3: Message Components

**File:** `src/components/chat/Message.js` (new)

**Objective:** Render individual chat messages

**Code Tasks:**
```jsx
// 1. User message bubble (right-aligned, purple)
// 2. Assistant message bubble (left-aligned, gray)
// 3. Markdown rendering for assistant messages
// 4. Timestamp display
// 5. Copy button for long responses

// Styling:
// - Match game's dark theme
// - Rounded corners
// - Proper spacing
```

**Acceptance Criteria:**
- [ ] User/assistant messages visually distinct
- [ ] Markdown renders correctly (headers, lists, code)
- [ ] Timestamps formatted properly
- [ ] Copy button works

---

## Task 4.4: Sources Panel

**File:** `src/components/chat/SourcesPanel.js` (new)

**Objective:** Display source citations for transparency

**Code Tasks:**
```jsx
// 1. Collapsible panel below assistant message
// 2. List of source documents
// 3. Each source shows:
//    - Document name
//    - Page number (if available)
//    - Relevance score (as percentage or bar)
//    - Excerpt preview (truncated)
// 4. Click to expand excerpt

// Styling:
// - Subtle background
// - Small text
// - Non-intrusive
```

**Acceptance Criteria:**
- [ ] Sources display when available
- [ ] Collapsible to save space
- [ ] Relevance indicated visually
- [ ] Excerpts readable but not overwhelming

---

## Task 4.5: Input Area Component

**File:** `src/components/chat/InputArea.js` (new)

**Objective:** Handle user input with proper UX

**Code Tasks:**
```jsx
// 1. Textarea with auto-resize
// 2. Send button (or Enter key)
// 3. Shift+Enter for new line
// 4. Disabled state during loading
// 5. Character limit indicator (optional)

// Features:
// - Focus on panel open
// - Clear after send
// - Prevent empty sends
```

**Acceptance Criteria:**
- [ ] Multi-line input supported
- [ ] Enter sends, Shift+Enter newlines
- [ ] Disabled during API call
- [ ] Proper keyboard focus

---

## Task 4.6: State Management

**File:** `src/components/ChatbotPanel.js` (extend)

**Objective:** Manage chat state (messages, loading, errors)

**Code Tasks:**
```jsx
// State:
// - messages: Array of {role, content, timestamp, sources}
// - conversationId: string
// - isLoading: boolean
// - error: string | null
// - isOpen: boolean

// Handlers:
// - handleSend(message)
// - handleClose()
// - handleRetry() (for failed messages)
// - handleClear() (start new conversation)
```

**Acceptance Criteria:**
- [ ] Messages persist during session
- [ ] Conversation ID maintained for context
- [ ] Loading states handled correctly
- [ ] Errors displayed with retry option

---

## Task 4.7: Integration with Main App

**File:** `src/IFRS17TrainingGame.js` (extend)

**Objective:** Connect ChatbotIcon to ChatbotPanel

**Code Tasks:**
```jsx
// 1. Add isChatOpen state
// 2. Pass to ChatbotIcon as isOpen prop
// 3. Conditionally render ChatbotPanel
// 4. Handle open/close state

// Optional:
// - Persist chat history in localStorage
// - Show notification badge for new messages
```

**Acceptance Criteria:**
- [ ] Icon click opens panel
- [ ] Panel close button works
- [ ] State synced between icon and panel
- [ ] Mobile responsive

---

# Phase 5: Testing & Optimization

**Duration:** 3-4 days  
**Goal:** Ensure reliability and performance

---

## Task 5.1: Backend Unit Tests

**File:** `backend/tests/test_*.py`

**Test Cases:**
```python
# test_api.py
# - test_health_endpoint
# - test_chat_endpoint_success
# - test_chat_endpoint_error_handling
# - test_ingest_endpoint

# test_vectorstore.py
# - test_add_documents
# - test_similarity_search
# - test_document_count

# test_nodes.py
# - test_classify_query_greeting
# - test_classify_query_ifrs
# - test_retrieve_documents
# - test_generate_answer
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Code coverage > 80%
- [ ] CI pipeline runs tests

---

## Task 5.2: Frontend Tests

**File:** `src/components/__tests__/`

**Test Cases:**
```javascript
// ChatbotIcon.test.js
// - renders correctly
// - opens on click
// - shows tooltip on hover

// ChatbotPanel.test.js
// - renders message list
// - sends message on submit
// - shows loading state
// - displays errors
```

**Acceptance Criteria:**
- [ ] Components render without errors
- [ ] User interactions tested
- [ ] API mocking works correctly

---

## Task 5.3: Performance Optimization

**Tasks:**
```
Backend:
1. Add response caching for repeated questions
2. Optimize chunk size for retrieval quality
3. Add connection pooling for database
4. Implement request queuing for rate limits

Frontend:
1. Lazy load ChatbotPanel
2. Virtualize message list for long conversations
3. Debounce input handling
4. Optimize re-renders with memo
```

**Acceptance Criteria:**
- [ ] Response time < 3 seconds for 90% of queries
- [ ] No UI jank during interaction
- [ ] Memory usage stable over time

---

## Task 5.4: Prompt Engineering

**File:** `backend/app/core/nodes.py`

**Tasks:**
```
1. Refine system prompt for IFRS 17 expertise
2. Add few-shot examples for common questions
3. Test edge cases (off-topic, ambiguous)
4. Optimize context window usage
```

**Test Questions:**
- "What is the CSM under IFRS 17?"
- "How do you calculate the risk adjustment?"
- "What's the difference between GMM and PAA?"
- "When should VFA be applied?"

**Acceptance Criteria:**
- [ ] Accurate answers for common IFRS 17 questions
- [ ] Appropriate "I don't know" for off-topic
- [ ] Consistent formatting in responses

---

# Appendix: File Creation Checklist

## Backend Files
- [x] `backend/requirements.txt`
- [x] `backend/.env.example`
- [x] `backend/README.md`
- [x] `backend/app/__init__.py`
- [x] `backend/app/main.py`
- [x] `backend/app/config.py`
- [x] `backend/app/api/__init__.py`
- [x] `backend/app/api/routes.py`
- [x] `backend/app/api/schemas.py`
- [x] `backend/app/core/__init__.py`
- [x] `backend/app/core/state.py`
- [x] `backend/app/core/nodes.py`
- [x] `backend/app/core/graph.py`
- [x] `backend/app/rag/__init__.py`
- [x] `backend/app/rag/embeddings.py`
- [x] `backend/app/rag/vectorstore.py`
- [ ] `backend/app/rag/retriever.py`
- [x] `backend/app/utils/__init__.py`
- [x] `backend/app/utils/document_loader.py`
- [x] `backend/app/utils/text_splitter.py`
- [x] `backend/tests/__init__.py`
- [x] `backend/tests/test_api.py`
- [x] `backend/data/documents/README.md`

## Frontend Files
- [x] `src/components/ChatbotIcon.js`
- [ ] `src/components/ChatbotPanel.js`
- [ ] `src/components/chat/Message.js`
- [ ] `src/components/chat/SourcesPanel.js`
- [ ] `src/components/chat/InputArea.js`
- [ ] `src/services/chatbotService.js`

## Documentation
- [x] `docs/CHATBOT_IMPLEMENTATION_PLAN.md`
- [x] `docs/API_REFERENCE.md`
- [x] `docs/SETUP_GUIDE.md`
- [x] `docs/CODING_PLAN.md`

---

*Document Version: 1.0.0*  
*Last Updated: December 2025*  
*Author: Kenbright AI Team*
