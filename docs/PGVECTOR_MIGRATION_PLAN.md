# Supabase pgvector Migration Plan

## IFRS 17 Training Game - RAG Chatbot Vector Store Migration

**Document Version:** 1.0  
**Created:** January 10, 2026  
**Status:** Planning  
**Estimated Effort:** 4-6 hours  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture](#2-current-architecture)
3. [Target Architecture](#3-target-architecture)
4. [Prerequisites](#4-prerequisites)
5. [Phase 1: Database Setup](#5-phase-1-database-setup)
6. [Phase 2: Backend Code Migration](#6-phase-2-backend-code-migration)
7. [Phase 3: Document Ingestion](#7-phase-3-document-ingestion)
8. [Phase 4: Testing](#8-phase-4-testing)
9. [Phase 5: Deployment](#9-phase-5-deployment)
10. [Rollback Plan](#10-rollback-plan)
11. [Post-Migration Cleanup](#11-post-migration-cleanup)
12. [Risk Assessment](#12-risk-assessment)
13. [Timeline](#13-timeline)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Objective

Migrate the IFRS 17 Training Game's RAG (Retrieval-Augmented Generation) chatbot from ChromaDB (local file-based vector store) to Supabase pgvector (cloud-hosted PostgreSQL with vector extensions).

### 1.2 Rationale

| Issue with ChromaDB | Solution with pgvector |
|---------------------|------------------------|
| Render's ephemeral filesystem deletes vector data on each deploy | Persistent cloud storage survives all deployments |
| Requires re-ingestion after every restart | Data always available instantly |
| Local file dependencies complicate CI/CD | Single connection string, no file management |
| Separate service from main database | Unified database with existing user/game data |

### 1.3 Scope

- **In Scope:**
  - Enable pgvector extension in existing Supabase project
  - Create documents table with vector embeddings
  - Refactor `backend/app/rag/` module to use Supabase
  - Migrate 16 IFRS 17 markdown documents
  - Update environment variables and configuration

- **Out of Scope:**
  - Frontend changes (none required)
  - User data migration (unaffected)
  - API endpoint changes (same `/api/chat` interface)

---

## 2. Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CURRENT STATE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Frontend (React)                                            │
│        │                                                      │
│        ▼                                                      │
│   Backend (FastAPI)                                           │
│        │                                                      │
│        ├──────────────────┬───────────────────┐               │
│        ▼                  ▼                   ▼               │
│   ┌─────────┐      ┌───────────┐      ┌─────────────┐         │
│   │ OpenAI  │      │ ChromaDB  │      │  Supabase   │         │
│   │   API   │      │  (Local)  │      │ (Users/DB)  │         │
│   └─────────┘      └───────────┘      └─────────────┘         │
│                          │                                    │
│                    ⚠️ EPHEMERAL                               │
│                    Lost on deploy                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Current Files

| File | Purpose |
|------|---------|
| `backend/app/rag/service.py` | RAG service with ChromaDB initialization |
| `backend/app/rag/prompts.py` | System prompts for LLM |
| `backend/app/config.py` | Configuration with ChromaDB paths |
| `backend/data/chroma_db/` | Vector store persistence directory |
| `backend/data/documents/` | 16 IFRS 17 markdown source files |

### 2.2 Current Dependencies

```
# From requirements.txt
chromadb==0.4.22
langchain-community  # Contains Chroma integration
```

---

## 3. Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        TARGET STATE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Frontend (React)                                            │
│        │                                                      │
│        ▼                                                      │
│   Backend (FastAPI)  ──────► Render (Deployed)                │
│        │                                                      │
│        ├──────────────────────────────────────┐               │
│        ▼                                      ▼               │
│   ┌─────────┐                          ┌─────────────┐        │
│   │ OpenAI  │                          │  Supabase   │        │
│   │   API   │                          │  (Unified)  │        │
│   └─────────┘                          └─────────────┘        │
│                                               │               │
│                                    ┌──────────┴──────────┐    │
│                                    │                     │    │
│                              ┌─────────┐           ┌─────────┐│
│                              │ pgvector│           │  Users  ││
│                              │Documents│           │Progress ││
│                              │   ✅    │           │Leaderbd ││
│                              │PERSISTENT           └─────────┘│
│                              └─────────┘                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Target Database Schema

```sql
-- Existing tables (unchanged)
├── users
├── user_progress  
├── leaderboard
└── achievements

-- New table
└── documents (pgvector)
    ├── id (UUID)
    ├── content (TEXT)
    ├── metadata (JSONB)
    ├── embedding (VECTOR(1536))
    └── created_at (TIMESTAMPTZ)
```

---

## 4. Prerequisites

### 4.1 Access Requirements

- [ ] Supabase project dashboard access (existing project)
- [ ] Supabase service role key (for document ingestion)
- [ ] OpenAI API key (existing, for embeddings)

### 4.2 Environment Variables

Ensure these are configured:

| Variable | Required | Current Status |
|----------|----------|----------------|
| `SUPABASE_URL` | ✅ | Should exist for game |
| `SUPABASE_SERVICE_KEY` | ✅ | May need to add |
| `SUPABASE_ANON_KEY` | ✅ | Should exist for game |
| `OPENAI_API_KEY` | ✅ | Already configured |

### 4.3 Local Development Setup

```bash
# Ensure Python virtual environment is active
cd backend
.\venv311\Scripts\activate

# Install new dependencies (will be added)
pip install vecs supabase
```

---

## 5. Phase 1: Database Setup

**Estimated Time:** 15 minutes

### 5.1 Enable pgvector Extension

Execute in Supabase SQL Editor:

```sql
-- Step 1: Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 5.2 Create Documents Table

```sql
-- Step 2: Create the documents table for RAG
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding VECTOR(1536),  -- OpenAI text-embedding-3-small dimension
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create index for fast similarity search
-- Using HNSW (Hierarchical Navigable Small World) for best performance
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Step 4: Create index on metadata for filtering
CREATE INDEX IF NOT EXISTS documents_metadata_idx 
ON documents 
USING gin (metadata);

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5.3 Create Match Function for Similarity Search

```sql
-- Step 6: Create the similarity search function
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        documents.id,
        documents.content,
        documents.metadata,
        1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

### 5.4 Set Up Row Level Security (Optional but Recommended)

```sql
-- Step 7: Enable RLS (documents are read-only for API)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for ingestion)
CREATE POLICY "Service role has full access to documents"
ON documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read (for queries)
CREATE POLICY "Authenticated users can read documents"
ON documents
FOR SELECT
TO authenticated
USING (true);

-- Allow anon users to read (if chatbot is public)
CREATE POLICY "Anonymous users can read documents"
ON documents
FOR SELECT
TO anon
USING (true);
```

### 5.5 Verification Query

```sql
-- Verify setup
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;
```

---

## 6. Phase 2: Backend Code Migration

**Estimated Time:** 2-3 hours

### 6.1 Update Dependencies

Add to `backend/requirements.txt`:

```txt
# Vector store - Supabase pgvector
vecs>=0.4.0
supabase>=2.0.0

# Remove or comment out (optional, can keep for local dev)
# chromadb==0.4.22
```

### 6.2 Update Configuration

**File:** `backend/app/config.py`

Add new settings:

```python
# Supabase pgvector settings
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")

# Vector store settings
VECTOR_STORE_TYPE: str = os.getenv("VECTOR_STORE_TYPE", "supabase")  # Changed default
EMBEDDING_DIMENSION: int = 1536  # OpenAI text-embedding-3-small
```

### 6.3 Create Supabase Vector Store Service

**New File:** `backend/app/rag/supabase_vectorstore.py`

```python
"""
Supabase pgvector implementation for RAG document storage and retrieval.
"""
import logging
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from langchain_openai import OpenAIEmbeddings

logger = logging.getLogger(__name__)


class SupabaseVectorStore:
    """Vector store implementation using Supabase pgvector."""
    
    def __init__(
        self,
        supabase_url: str,
        supabase_key: str,
        table_name: str = "documents",
        embedding_dimension: int = 1536
    ):
        self.client: Client = create_client(supabase_url, supabase_key)
        self.table_name = table_name
        self.embedding_dimension = embedding_dimension
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        
    async def add_documents(
        self,
        documents: List[Dict[str, Any]],
        batch_size: int = 100
    ) -> int:
        """
        Add documents with embeddings to the vector store.
        
        Args:
            documents: List of dicts with 'content' and optional 'metadata'
            batch_size: Number of documents to insert per batch
            
        Returns:
            Number of documents added
        """
        total_added = 0
        
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]
            
            # Generate embeddings for batch
            texts = [doc["content"] for doc in batch]
            embeddings = await self.embeddings.aembed_documents(texts)
            
            # Prepare records for insertion
            records = [
                {
                    "content": doc["content"],
                    "metadata": doc.get("metadata", {}),
                    "embedding": embedding
                }
                for doc, embedding in zip(batch, embeddings)
            ]
            
            # Insert into Supabase
            result = self.client.table(self.table_name).insert(records).execute()
            total_added += len(result.data)
            
            logger.info(f"Inserted batch {i // batch_size + 1}: {len(batch)} documents")
        
        return total_added
    
    async def similarity_search(
        self,
        query: str,
        k: int = 5,
        threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents using cosine similarity.
        
        Args:
            query: Search query text
            k: Number of results to return
            threshold: Minimum similarity threshold (0-1)
            
        Returns:
            List of matching documents with similarity scores
        """
        # Generate query embedding
        query_embedding = await self.embeddings.aembed_query(query)
        
        # Call the match_documents function
        result = self.client.rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": k
            }
        ).execute()
        
        return result.data
    
    async def delete_all(self) -> int:
        """Delete all documents from the store."""
        result = self.client.table(self.table_name).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        return len(result.data) if result.data else 0
    
    async def get_document_count(self) -> int:
        """Get total number of documents in the store."""
        result = self.client.table(self.table_name).select("id", count="exact").execute()
        return result.count or 0
```

### 6.4 Update RAG Service

**File:** `backend/app/rag/service.py`

Key changes:
1. Import new `SupabaseVectorStore`
2. Replace ChromaDB initialization with Supabase
3. Update `retrieve_context()` method
4. Update `ingest_documents()` method

```python
# Replace ChromaDB imports with:
from app.rag.supabase_vectorstore import SupabaseVectorStore

# In RAGService.__init__():
self.vector_store = SupabaseVectorStore(
    supabase_url=settings.SUPABASE_URL,
    supabase_key=settings.SUPABASE_SERVICE_KEY,
    table_name="documents"
)

# Update retrieve_context():
async def retrieve_context(self, query: str) -> str:
    results = await self.vector_store.similarity_search(
        query=query,
        k=settings.RAG_MAX_DOCUMENTS,
        threshold=settings.RAG_SIMILARITY_THRESHOLD
    )
    
    if not results:
        return ""
    
    context_parts = []
    for doc in results:
        source = doc.get("metadata", {}).get("source", "Unknown")
        context_parts.append(f"[Source: {source}]\n{doc['content']}")
    
    return "\n\n---\n\n".join(context_parts)
```

### 6.5 Update Ingestion Endpoint

**File:** `backend/app/api/routes/rag.py`

Update the `/api/rag/ingest` endpoint to use the new vector store:

```python
@router.post("/ingest")
async def ingest_documents():
    """Ingest IFRS 17 documents into Supabase pgvector."""
    try:
        # Clear existing documents
        await rag_service.vector_store.delete_all()
        
        # Load and process documents
        documents = load_documents_from_directory(settings.DOCUMENTS_PATH)
        
        # Add to vector store
        count = await rag_service.vector_store.add_documents(documents)
        
        return {
            "status": "success",
            "documents_ingested": count,
            "message": f"Successfully ingested {count} document chunks"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 7. Phase 3: Document Ingestion

**Estimated Time:** 30 minutes

### 7.1 Prepare Documents

The 16 IFRS 17 markdown documents in `backend/data/documents/` will be:
1. Read from the filesystem
2. Split into chunks (existing logic)
3. Embedded using OpenAI
4. Stored in Supabase pgvector

### 7.2 Run Ingestion

```bash
# Local testing
cd backend
.\venv311\Scripts\activate

# Start the server
python -m uvicorn app.main:app --reload

# In another terminal, trigger ingestion
curl -X POST http://localhost:8000/api/rag/ingest
```

### 7.3 Verify Ingestion

```sql
-- Run in Supabase SQL Editor
SELECT 
    COUNT(*) as total_documents,
    COUNT(embedding) as documents_with_embeddings,
    COUNT(DISTINCT metadata->>'source') as unique_sources
FROM documents;

-- Sample documents
SELECT 
    id,
    LEFT(content, 100) as content_preview,
    metadata->>'source' as source,
    created_at
FROM documents
LIMIT 5;
```

---

## 8. Phase 4: Testing

**Estimated Time:** 1 hour

### 8.1 Unit Tests

**File:** `backend/tests/test_vectorstore.py`

```python
import pytest
from app.rag.supabase_vectorstore import SupabaseVectorStore

@pytest.mark.asyncio
async def test_similarity_search():
    """Test that similarity search returns relevant results."""
    store = SupabaseVectorStore(...)
    
    results = await store.similarity_search(
        query="What is the General Measurement Model?",
        k=3
    )
    
    assert len(results) > 0
    assert results[0]["similarity"] > 0.7
    assert "GMM" in results[0]["content"] or "General" in results[0]["content"]

@pytest.mark.asyncio
async def test_document_count():
    """Test document count after ingestion."""
    store = SupabaseVectorStore(...)
    count = await store.get_document_count()
    assert count > 0
```

### 8.2 Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Query about GMM | Returns documents mentioning General Measurement Model |
| Query about CSM | Returns documents about Contractual Service Margin |
| Query about PAA | Returns Premium Allocation Approach content |
| Irrelevant query | Returns empty or low-similarity results |
| Health check | `/health` returns `"vector_store": "connected"` |

### 8.3 Manual Testing Checklist

- [ ] Start backend server locally
- [ ] Run document ingestion
- [ ] Test chat endpoint with IFRS 17 questions
- [ ] Verify responses include source citations
- [ ] Check Supabase dashboard for document count
- [ ] Test with frontend chatbot UI

---

## 9. Phase 5: Deployment

**Estimated Time:** 30 minutes

### 9.1 Update Render Environment Variables

In Render Dashboard → Environment:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (service role key) |
| `SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `OPENAI_API_KEY` | `sk-...` |
| `VECTOR_STORE_TYPE` | `supabase` |
| `CORS_ORIGINS` | `https://your-frontend.com` |

### 9.2 Deploy to Render

```bash
# Commit changes
git add .
git commit -m "Migrate RAG from ChromaDB to Supabase pgvector"
git push origin main

# Render will auto-deploy if connected
```

### 9.3 Post-Deployment Verification

1. **Check Render logs** for startup errors
2. **Test health endpoint:** `https://your-api.onrender.com/health`
3. **Run ingestion** (one-time after first deploy):
   ```bash
   curl -X POST https://your-api.onrender.com/api/rag/ingest
   ```
4. **Test chat endpoint** with a sample question

### 9.4 Deployment Checklist

- [ ] All environment variables set in Render
- [ ] Deployment successful (no build errors)
- [ ] Health check passes
- [ ] Documents ingested to Supabase
- [ ] Chat endpoint responds correctly
- [ ] Frontend can communicate with backend

---

## 10. Rollback Plan

### 10.1 If Migration Fails

**Immediate Rollback Steps:**

1. Revert git commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. In Render, redeploy previous version

3. ChromaDB will work locally (but not persist on Render)

### 10.2 Keep ChromaDB as Fallback

The code can support both backends with a feature flag:

```python
# In config.py
VECTOR_STORE_TYPE: str = os.getenv("VECTOR_STORE_TYPE", "supabase")

# In service.py
if settings.VECTOR_STORE_TYPE == "supabase":
    self.vector_store = SupabaseVectorStore(...)
else:
    self.vector_store = ChromaDB(...)
```

---

## 11. Post-Migration Cleanup

### 11.1 Remove ChromaDB (Optional)

After confirming Supabase works in production:

1. Remove from `requirements.txt`:
   ```txt
   # chromadb==0.4.22  # Removed - using Supabase pgvector
   ```

2. Delete local ChromaDB data:
   ```bash
   rm -rf backend/data/chroma_db/
   ```

3. Remove ChromaDB-related code from `service.py`

### 11.2 Update Documentation

- [ ] Update `backend/README.md` with new setup instructions
- [ ] Update `docs/SETUP_GUIDE.md` with Supabase pgvector info
- [ ] Archive `docs/SUPABASE_PGVECTOR_PLAN.md` (original plan)

---

## 12. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase downtime | Low | High | Supabase has 99.9% uptime SLA |
| Embedding cost increase | Low | Medium | Same embeddings used, no change |
| Query latency increase | Medium | Low | pgvector HNSW index is fast (~10ms) |
| Data loss during migration | Low | High | Keep ChromaDB backup until verified |
| RLS misconfiguration | Medium | Medium | Test with anon/authenticated tokens |

---

## 13. Timeline

### Estimated Total: 4-6 hours

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Database Setup | 15 min | Supabase access |
| Phase 2: Backend Code | 2-3 hours | Phase 1 complete |
| Phase 3: Document Ingestion | 30 min | Phases 1-2 complete |
| Phase 4: Testing | 1 hour | Phases 1-3 complete |
| Phase 5: Deployment | 30 min | All phases complete |

### Suggested Schedule

```
Day 1 (Development):
  ├── 09:00 - Phase 1: Database Setup
  ├── 09:30 - Phase 2: Backend Code Migration
  ├── 12:00 - Break
  ├── 13:00 - Phase 3: Document Ingestion
  └── 14:00 - Phase 4: Testing

Day 2 (Deployment):
  ├── 09:00 - Phase 5: Deployment to Render
  ├── 10:00 - Production Verification
  └── 11:00 - Post-Migration Cleanup
```

---

## 14. Appendix

### A. SQL Scripts Reference

All SQL scripts are provided in Phase 1 and can be run in sequence in the Supabase SQL Editor.

### B. Environment Variables Template

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Vector Store Configuration
VECTOR_STORE_TYPE=supabase
RAG_MAX_DOCUMENTS=5
RAG_SIMILARITY_THRESHOLD=0.7

# Server Configuration
PORT=8000
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### C. Useful Supabase Queries

```sql
-- Check document count by source
SELECT 
    metadata->>'source' as source,
    COUNT(*) as chunks
FROM documents
GROUP BY metadata->>'source'
ORDER BY chunks DESC;

-- Test similarity search manually
SELECT 
    LEFT(content, 200) as content,
    metadata->>'source' as source,
    1 - (embedding <=> '[0.1, 0.2, ...]'::vector) as similarity
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;

-- Clear all documents (for re-ingestion)
TRUNCATE TABLE documents;
```

### D. Monitoring Queries

```sql
-- Table size
SELECT 
    pg_size_pretty(pg_total_relation_size('documents')) as total_size,
    pg_size_pretty(pg_relation_size('documents')) as table_size,
    pg_size_pretty(pg_indexes_size('documents')) as index_size;

-- Index usage
SELECT 
    indexrelname as index_name,
    idx_scan as times_used,
    idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE relname = 'documents';
```

---

## Approval & Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Reviewer | | | |
| Approver | | | |

---

*Document maintained by: IFRS 17 Training Game Development Team*
