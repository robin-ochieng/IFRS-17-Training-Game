# IFRS 17 RAG Chatbot - Comprehensive Implementation Plan

## 📋 Executive Summary

This document outlines the complete plan for building a **LangGraph-powered RAG (Retrieval-Augmented Generation) chatbot** for the IFRS 17 Training Game. The chatbot will provide intelligent, context-aware answers to user questions about IFRS 17 insurance accounting standards.

---

## 🎯 Project Goals

1. **Accurate Answers**: Provide precise answers grounded in official IFRS 17 documentation
2. **Source Attribution**: Always cite the source document and page for transparency
3. **Conversational Memory**: Maintain context across multi-turn conversations
4. **Low Latency**: Respond within 2-3 seconds for a smooth user experience
5. **Scalability**: Handle concurrent users without performance degradation

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │  ChatbotIcon    │───▶│         ChatbotPanel                │ │
│  │  (Floating)     │    │  - Message List                     │ │
│  └─────────────────┘    │  - Input Field                      │ │
│                         │  - Source References                 │ │
│                         └─────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP/WebSocket
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │   API Routes    │───▶│         LangGraph Workflow          │ │
│  │  /api/chat      │    │                                     │ │
│  │  /api/ingest    │    │  ┌──────────┐   ┌───────────────┐  │ │
│  │  /api/health    │    │  │ Classify │──▶│   Retrieve    │  │ │
│  └─────────────────┘    │  │  Query   │   │   Documents   │  │ │
│                         │  └──────────┘   └───────┬───────┘  │ │
│                         │                         ▼          │ │
│                         │  ┌──────────┐   ┌───────────────┐  │ │
│                         │  │ Format   │◀──│   Generate    │  │ │
│                         │  │ Response │   │    Answer     │  │ │
│                         │  └──────────┘   └───────────────┘  │ │
│                         └─────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │   ChromaDB      │    │         OpenAI API                   │ │
│  │  Vector Store   │    │  - Embeddings (text-embedding-3)    │ │
│  │  - IFRS 17 Docs │    │  - Chat (GPT-4 Turbo)               │ │
│  └─────────────────┘    └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Backend Framework** | FastAPI | Async support, automatic OpenAPI docs, high performance |
| **Workflow Engine** | LangGraph | State management, complex agent workflows, debugging |
| **LLM Provider** | OpenAI GPT-4 Turbo | Best-in-class reasoning, large context window |
| **Embeddings** | OpenAI text-embedding-3-small | Cost-effective, high quality |
| **Vector Store** | ChromaDB | Easy setup, persistent storage, good performance |
| **Document Parsing** | PyPDF, Unstructured | Handle PDFs and complex documents |

---

## 📂 Data Sources

### Primary Documents
1. **IFRS 17 Insurance Contracts (Official Standard)**
   - Source: IFRS Foundation
   - URL: https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ifrs-17-insurance-contracts.pdf
   - Pages: ~100+
   - Priority: HIGH

2. **IFRS 17 Illustrative Examples**
   - Practical scenarios and calculations
   - Priority: HIGH

3. **IFRS 17 Basis for Conclusions**
   - Background and rationale
   - Priority: MEDIUM

4. **Training Game Questions & Answers**
   - Existing Q&A from the game modules
   - Priority: HIGH (ensures consistency)

### Document Processing Pipeline
```
PDF/DOCX ──▶ Load ──▶ Split ──▶ Embed ──▶ Store
                      │
                      ▼
               Chunk Size: 1000 chars
               Overlap: 200 chars
               Splitter: Recursive
```

---

## 🔄 LangGraph Workflow Design

### State Schema
```python
class GraphState(TypedDict):
    question: str              # User's question
    conversation_id: str       # Session tracking
    chat_history: List[dict]   # Previous messages
    retrieved_documents: List  # RAG results
    context: str               # Formatted context
    should_search: bool        # Routing decision
    answer: str                # Generated answer
    sources: List[dict]        # Source citations
    error: Optional[str]       # Error handling
```

### Node Descriptions

1. **classify_query**
   - Determines if the query needs document retrieval
   - Handles greetings and off-topic queries gracefully
   - Routes to retrieval or direct response

2. **retrieve_documents**
   - Queries ChromaDB for similar chunks
   - Returns top-k documents with scores
   - Filters by relevance threshold

3. **generate_answer**
   - Constructs prompt with context and history
   - Calls GPT-4 for response generation
   - Includes IFRS 17-specific instructions

4. **format_response**
   - Structures the output with sources
   - Formats citations for frontend display

### Workflow Diagram
```
[START]
    │
    ▼
┌───────────────┐
│ classify_query│
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│retrieve_documents │
└────────┬──────────┘
         │
         ▼
┌────────────────┐
│generate_answer │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│format_response │
└───────┬────────┘
        │
        ▼
      [END]
```

---

## 🛠️ Implementation Phases

### Phase 1: Backend Foundation (Week 1)
- [x] Project structure setup
- [x] FastAPI application with routes
- [x] Configuration management
- [x] Basic LangGraph workflow skeleton
- [ ] OpenAI integration
- [ ] Error handling & logging

### Phase 2: RAG Pipeline (Week 2)
- [ ] Document loader implementation
- [ ] Text splitting with optimal chunk sizes
- [ ] ChromaDB vector store setup
- [ ] Embedding generation
- [ ] Similarity search with scoring
- [ ] Ingestion endpoint

### Phase 3: LangGraph Workflow (Week 2-3)
- [ ] Query classification node
- [ ] Context-aware retrieval
- [ ] Prompt engineering for IFRS 17
- [ ] Answer generation with citations
- [ ] Conversation memory
- [ ] Streaming responses (optional)

### Phase 4: Frontend Integration (Week 3)
- [x] Floating chatbot icon
- [ ] Chat panel component
- [ ] Message rendering (user/assistant)
- [ ] Source document display
- [ ] Loading states
- [ ] Error handling UI

### Phase 5: Testing & Optimization (Week 4)
- [ ] Unit tests for backend
- [ ] Integration tests
- [ ] Performance benchmarking
- [ ] Chunk size optimization
- [ ] Prompt refinement
- [ ] User acceptance testing

---

## 🎨 Frontend Components

### ChatbotIcon (Completed ✅)
- Floating button in bottom-right
- Pulse animation when closed
- Smooth open/close transitions
- Responsive design

### ChatbotPanel (To Build)
```jsx
<ChatbotPanel>
  <ChatHeader title="IFRS 17 Assistant" onClose={...} />
  <MessageList messages={[...]} />
  <SourcesPanel sources={[...]} />
  <InputArea onSend={...} isLoading={...} />
</ChatbotPanel>
```

### Features
- Dark theme matching game UI
- Markdown rendering for answers
- Collapsible source references
- Typing indicator
- Message timestamps
- Conversation history (session-based)

---

## 🔐 Security Considerations

1. **API Key Protection**
   - Store OpenAI key in environment variables
   - Never expose keys to frontend
   - Use backend proxy for all LLM calls

2. **Rate Limiting**
   - Implement per-user rate limits
   - Prevent abuse of OpenAI credits

3. **Input Sanitization**
   - Validate and sanitize user queries
   - Prevent prompt injection attacks

4. **CORS Configuration**
   - Restrict to allowed origins only

---

## 📊 Monitoring & Observability

1. **Logging**
   - Request/response logging
   - LLM call tracing
   - Error tracking

2. **Metrics**
   - Response latency
   - Token usage
   - Retrieval relevance scores
   - User engagement

3. **LangSmith Integration (Optional)**
   - Trace LangGraph execution
   - Debug workflow issues
   - Evaluate answer quality

---

## 💰 Cost Estimation

| Service | Model | Estimated Monthly Cost |
|---------|-------|----------------------|
| OpenAI Embeddings | text-embedding-3-small | ~$5-10 |
| OpenAI Chat | GPT-4 Turbo | ~$20-50 |
| ChromaDB | Self-hosted | $0 |
| **Total** | | **~$25-60/month** |

*Based on ~500 queries/month with average context*

---

## 🚀 Deployment Options

### Option A: Single Server (MVP)
- Host backend on Railway/Render/Fly.io
- Include vector store in same container
- Pros: Simple, low cost
- Cons: Not horizontally scalable

### Option B: Separated Services (Production)
- FastAPI on Cloud Run/App Runner
- ChromaDB on persistent volume
- OpenAI API for LLM
- Pros: Scalable, resilient
- Cons: More complex

---

## 📝 Next Steps

1. **Immediate**: Add your OpenAI API key to `.env`
2. **Short-term**: Download and place IFRS 17 PDF in `data/documents/`
3. **Medium-term**: Complete Phase 2 (RAG Pipeline)
4. **Long-term**: Build chat panel UI and integrate

---

## 📚 Resources

- [LangGraph Documentation](https://python.langchain.com/docs/langgraph)
- [LangChain RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [ChromaDB Guide](https://docs.trychroma.com/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [IFRS 17 Standard](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-17-insurance-contracts/)

---

*Document Version: 1.0.0*  
*Last Updated: December 2025*  
*Author: Kenbright AI Team*
