# Supabase pgvector Implementation Plan

## Overview

This document outlines the plan to replace ChromaDB with **Supabase pgvector** for the IFRS 17 RAG Chatbot. This consolidates your infrastructure by using your existing Supabase database for both user data and vector embeddings.

---

## 🎯 Benefits of Supabase pgvector

| Benefit | Description |
|---------|-------------|
| **Unified Infrastructure** | One database for users, progress, AND embeddings |
| **No Additional Services** | No ChromaDB server to manage |
| **Scalable** | Supabase handles scaling automatically |
| **Built-in Auth** | Can use Supabase RLS for access control |
| **SQL Queries** | Combine vector search with traditional SQL filters |
| **Backup & Recovery** | Supabase handles database backups |

---

## 📋 Implementation Phases

### Phase 1: Database Setup
### Phase 2: Backend Integration  
### Phase 3: Document Ingestion
### Phase 4: Query Implementation
### Phase 5: Testing & Optimization

---

# Phase 1: Database Setup

## Task 1.1: Enable pgvector Extension

**Location:** Supabase SQL Editor

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

**Verification:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## Task 1.2: Create Document Chunks Table

**Location:** Supabase SQL Editor

```sql
-- =====================================================
-- DOCUMENT CHUNKS TABLE FOR RAG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id BIGSERIAL PRIMARY KEY,
    
    -- Content
    content TEXT NOT NULL,
    
    -- Embedding vector (1536 dimensions for OpenAI text-embedding-3-small)
    embedding VECTOR(1536),
    
    -- Metadata
    source TEXT NOT NULL,                    -- Document filename
    page INTEGER,                            -- Page number (if applicable)
    chunk_index INTEGER NOT NULL DEFAULT 0,  -- Order within document
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT document_chunks_content_not_empty CHECK (char_length(content) > 0)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Vector similarity search index (IVFFlat for faster queries)
-- Note: Create this AFTER inserting documents for better index quality
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Traditional indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_source 
ON public.document_chunks (source);

CREATE INDEX IF NOT EXISTS idx_document_chunks_created 
ON public.document_chunks (created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Allow public read access (documents are not sensitive)
CREATE POLICY "Allow public read access" ON public.document_chunks
    FOR SELECT TO anon, authenticated
    USING (true);

-- Only allow service role to insert/update/delete
CREATE POLICY "Allow service role full access" ON public.document_chunks
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

---

## Task 1.3: Create Similarity Search Function

**Location:** Supabase SQL Editor

```sql
-- =====================================================
-- SIMILARITY SEARCH FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    source TEXT,
    page INTEGER,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        dc.source,
        dc.page,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

**Usage Example:**
```sql
-- Call from backend with embedding array
SELECT * FROM match_documents(
    '[0.1, 0.2, ...]'::vector,  -- Query embedding
    0.7,                         -- Threshold
    5                            -- Max results
);
```

---

## Task 1.4: Create Document Stats View

**Location:** Supabase SQL Editor

```sql
-- =====================================================
-- DOCUMENT STATISTICS VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.document_stats AS
SELECT 
    COUNT(*) as total_chunks,
    COUNT(DISTINCT source) as total_documents,
    AVG(char_length(content))::INTEGER as avg_chunk_size,
    MIN(created_at) as first_ingested,
    MAX(created_at) as last_ingested
FROM public.document_chunks;

-- Grant access
GRANT SELECT ON public.document_stats TO anon, authenticated;
```

---

# Phase 2: Backend Integration

## Task 2.1: Update Requirements

**File:** `backend/requirements.txt`

```txt
# Add/Update these dependencies
supabase>=2.0.0
vecs>=0.4.0  # Supabase vector client (optional, can use direct SQL)
```

---

## Task 2.2: Create Supabase Vector Store Module

**File:** `backend/app/rag/supabase_vectorstore.py` (NEW)

```python
"""
Supabase pgvector Store for IFRS 17 RAG Chatbot
"""
import os
import logging
from typing import List, Optional, Dict, Any
from supabase import create_client, Client

from app.config import settings
from app.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)

# Supabase client singleton
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Get or create Supabase client."""
    global _supabase_client
    
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY  # Use service key for write access
        )
        logger.info("Supabase client initialized")
    
    return _supabase_client


async def add_documents(documents: List[Dict[str, Any]]) -> int:
    """
    Add document chunks with embeddings to Supabase.
    
    Args:
        documents: List of dicts with 'content', 'source', 'page', 'chunk_index'
        
    Returns:
        Number of documents added
    """
    if not documents:
        return 0
    
    client = get_supabase_client()
    embeddings_model = get_embeddings()
    
    # Generate embeddings for all documents
    contents = [doc['content'] for doc in documents]
    embeddings = embeddings_model.embed_documents(contents)
    
    # Prepare records for insertion
    records = []
    for doc, embedding in zip(documents, embeddings):
        records.append({
            'content': doc['content'],
            'embedding': embedding,
            'source': doc['source'],
            'page': doc.get('page'),
            'chunk_index': doc.get('chunk_index', 0)
        })
    
    # Batch insert
    result = client.table('document_chunks').insert(records).execute()
    
    logger.info(f"Added {len(records)} document chunks to Supabase")
    return len(records)


async def similarity_search(
    query: str,
    k: int = None,
    threshold: float = None
) -> List[Dict[str, Any]]:
    """
    Search for similar documents using pgvector.
    
    Args:
        query: Search query text
        k: Number of results to return
        threshold: Minimum similarity score (0-1)
        
    Returns:
        List of matching documents with similarity scores
    """
    client = get_supabase_client()
    embeddings_model = get_embeddings()
    
    k = k or settings.MAX_CONTEXT_DOCUMENTS
    threshold = threshold or settings.SIMILARITY_THRESHOLD
    
    # Generate query embedding
    query_embedding = embeddings_model.embed_query(query)
    
    # Call the match_documents function
    result = client.rpc(
        'match_documents',
        {
            'query_embedding': query_embedding,
            'match_threshold': threshold,
            'match_count': k
        }
    ).execute()
    
    documents = []
    for row in result.data:
        documents.append({
            'content': row['content'],
            'source': row['source'],
            'page': row['page'],
            'relevance_score': row['similarity']
        })
    
    return documents


async def get_document_count() -> int:
    """Get total number of document chunks."""
    client = get_supabase_client()
    
    result = client.table('document_chunks').select('id', count='exact').execute()
    return result.count or 0


async def get_document_stats() -> Dict[str, Any]:
    """Get document statistics."""
    client = get_supabase_client()
    
    result = client.table('document_stats').select('*').execute()
    
    if result.data:
        return result.data[0]
    return {
        'total_chunks': 0,
        'total_documents': 0,
        'avg_chunk_size': 0
    }


async def clear_documents(source: str = None):
    """
    Clear documents from the store.
    
    Args:
        source: If provided, only clear documents from this source.
                If None, clear all documents.
    """
    client = get_supabase_client()
    
    if source:
        client.table('document_chunks').delete().eq('source', source).execute()
        logger.info(f"Cleared documents from source: {source}")
    else:
        client.table('document_chunks').delete().neq('id', 0).execute()
        logger.info("Cleared all documents from store")


async def document_exists(source: str) -> bool:
    """Check if a document source already exists."""
    client = get_supabase_client()
    
    result = client.table('document_chunks') \
        .select('id') \
        .eq('source', source) \
        .limit(1) \
        .execute()
    
    return len(result.data) > 0
```

---

## Task 2.3: Update Configuration

**File:** `backend/app/config.py`

```python
# Add these settings
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")  # Service role key for writes
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")  # Anon key for reads
```

---

## Task 2.4: Update Environment Variables

**File:** `backend/.env.example`

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Vector Store Configuration (updated)
VECTOR_STORE_TYPE=supabase  # Changed from 'chroma'
```

---

# Phase 3: Document Ingestion

## Task 3.1: Create Ingestion Script

**File:** `backend/scripts/ingest_documents.py` (NEW)

```python
"""
Script to ingest IFRS 17 documents into Supabase pgvector.

Usage:
    python -m scripts.ingest_documents
    python -m scripts.ingest_documents --refresh
"""
import asyncio
import argparse
import logging
from pathlib import Path

from app.config import settings
from app.utils.document_loader import load_documents
from app.utils.text_splitter import split_documents
from app.rag.supabase_vectorstore import (
    add_documents,
    clear_documents,
    get_document_stats
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def ingest(refresh: bool = False):
    """Ingest all documents from the documents directory."""
    
    logger.info("Starting document ingestion...")
    
    # Clear existing if refresh requested
    if refresh:
        logger.info("Refreshing: Clearing existing documents...")
        await clear_documents()
    
    # Load documents
    logger.info(f"Loading documents from {settings.DOCS_DIRECTORY}")
    documents = load_documents()
    
    if not documents:
        logger.warning("No documents found!")
        return
    
    logger.info(f"Loaded {len(documents)} documents")
    
    # Split into chunks
    logger.info("Splitting documents into chunks...")
    chunks = split_documents(documents)
    logger.info(f"Created {len(chunks)} chunks")
    
    # Prepare for insertion
    chunk_records = []
    for i, chunk in enumerate(chunks):
        chunk_records.append({
            'content': chunk.page_content,
            'source': chunk.metadata.get('source', 'unknown'),
            'page': chunk.metadata.get('page'),
            'chunk_index': i
        })
    
    # Add to Supabase
    logger.info("Adding chunks to Supabase pgvector...")
    count = await add_documents(chunk_records)
    
    # Get stats
    stats = await get_document_stats()
    
    logger.info("=" * 50)
    logger.info("INGESTION COMPLETE")
    logger.info("=" * 50)
    logger.info(f"Total chunks: {stats['total_chunks']}")
    logger.info(f"Total documents: {stats['total_documents']}")
    logger.info(f"Average chunk size: {stats['avg_chunk_size']} chars")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest documents into Supabase pgvector")
    parser.add_argument('--refresh', action='store_true', help='Clear existing documents first')
    args = parser.parse_args()
    
    asyncio.run(ingest(refresh=args.refresh))
```

---

## Task 3.2: Update Ingest API Endpoint

**File:** `backend/app/api/routes.py` (UPDATE)

```python
# Update the ingest endpoint to use Supabase

from app.rag.supabase_vectorstore import (
    add_documents,
    clear_documents,
    get_document_stats
)
from app.utils.document_loader import load_documents
from app.utils.text_splitter import split_documents


@router.post("/ingest", response_model=IngestResponse)
async def ingest_documents(request: IngestRequest):
    """Ingest documents into Supabase pgvector."""
    try:
        # Clear if refresh requested
        if request.refresh_all:
            await clear_documents()
        
        # Load and split documents
        documents = load_documents(request.document_path)
        chunks = split_documents(documents)
        
        # Prepare chunk records
        chunk_records = []
        for i, chunk in enumerate(chunks):
            chunk_records.append({
                'content': chunk.page_content,
                'source': chunk.metadata.get('source', 'unknown'),
                'page': chunk.metadata.get('page'),
                'chunk_index': i
            })
        
        # Add to Supabase
        count = await add_documents(chunk_records)
        
        return IngestResponse(
            success=True,
            documents_processed=len(documents),
            chunks_created=count,
            message=f"Successfully ingested {len(documents)} documents into {count} chunks"
        )
        
    except Exception as e:
        logger.error(f"Error ingesting documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

# Phase 4: Query Implementation

## Task 4.1: Update Retrieval Node

**File:** `backend/app/core/nodes.py` (UPDATE)

```python
from app.rag.supabase_vectorstore import similarity_search


async def retrieve_documents(state: GraphState) -> Dict[str, Any]:
    """Retrieve relevant documents from Supabase pgvector."""
    
    if not state.get("should_search", True):
        return {
            "retrieved_documents": [],
            "context": ""
        }
    
    question = state["question"]
    
    # Query Supabase pgvector
    documents = await similarity_search(question)
    
    # Format context
    context_parts = []
    for i, doc in enumerate(documents, 1):
        source_info = f"[{doc['source']}"
        if doc.get('page'):
            source_info += f", Page {doc['page']}"
        source_info += "]"
        
        context_parts.append(f"Source {i} {source_info}:\n{doc['content']}")
    
    context = "\n\n---\n\n".join(context_parts)
    
    return {
        "retrieved_documents": documents,
        "context": context
    }
```

---

## Task 4.2: Update Health Endpoint

**File:** `backend/app/api/routes.py` (UPDATE)

```python
from app.rag.supabase_vectorstore import get_document_stats


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check with Supabase vector store status."""
    try:
        stats = await get_document_stats()
        return HealthResponse(
            status="healthy",
            version="1.0.0",
            vector_store_ready=stats['total_chunks'] > 0,
            documents_count=stats['total_chunks']
        )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(
            status="degraded",
            version="1.0.0",
            vector_store_ready=False,
            documents_count=0
        )
```

---

# Phase 5: Testing & Optimization

## Task 5.1: Test SQL Queries

**Location:** Supabase SQL Editor

```sql
-- Test 1: Check document count
SELECT COUNT(*) FROM document_chunks;

-- Test 2: Check unique sources
SELECT DISTINCT source FROM document_chunks;

-- Test 3: Test similarity search (requires embedding)
-- This will be tested via API

-- Test 4: Check index usage
EXPLAIN ANALYZE 
SELECT * FROM match_documents(
    (SELECT embedding FROM document_chunks LIMIT 1),
    0.5,
    5
);
```

---

## Task 5.2: Performance Tuning

**Recommendations:**

1. **Index Tuning:**
```sql
-- After inserting all documents, recreate the index with optimal lists
-- Rule of thumb: lists = sqrt(num_rows)
DROP INDEX IF EXISTS idx_document_chunks_embedding;

CREATE INDEX idx_document_chunks_embedding 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);  -- Adjust based on document count
```

2. **Query Optimization:**
```sql
-- Use HNSW index for faster queries (if available in your Supabase version)
CREATE INDEX idx_document_chunks_embedding_hnsw
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);
```

---

## Task 5.3: Monitoring Queries

```sql
-- Monitor query performance
SELECT 
    query,
    calls,
    mean_time,
    total_time
FROM pg_stat_statements 
WHERE query LIKE '%document_chunks%'
ORDER BY total_time DESC
LIMIT 10;
```

---

# Migration Checklist

## Pre-Migration
- [ ] Backup existing ChromaDB data (if any)
- [ ] Note current document count
- [ ] Test Supabase connection

## Database Setup
- [ ] Enable pgvector extension
- [ ] Create document_chunks table
- [ ] Create match_documents function
- [ ] Create document_stats view
- [ ] Verify RLS policies

## Backend Updates
- [ ] Add supabase package to requirements
- [ ] Create supabase_vectorstore.py
- [ ] Update config.py with Supabase settings
- [ ] Update .env with Supabase keys
- [ ] Update retrieval node
- [ ] Update ingest endpoint
- [ ] Update health endpoint

## Testing
- [ ] Ingest test document
- [ ] Test similarity search
- [ ] Test API endpoints
- [ ] Verify response quality

## Cleanup
- [ ] Remove ChromaDB files (data/chroma_db)
- [ ] Remove ChromaDB from requirements
- [ ] Update documentation

---

# File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `backend/requirements.txt` | UPDATE | Add supabase, remove chromadb |
| `backend/.env.example` | UPDATE | Add Supabase keys |
| `backend/app/config.py` | UPDATE | Add Supabase settings |
| `backend/app/rag/supabase_vectorstore.py` | CREATE | New vector store module |
| `backend/app/rag/vectorstore.py` | DELETE | Remove ChromaDB module |
| `backend/app/core/nodes.py` | UPDATE | Use Supabase retrieval |
| `backend/app/api/routes.py` | UPDATE | Use Supabase for ingest/health |
| `backend/scripts/ingest_documents.py` | CREATE | Ingestion script |
| Supabase SQL | EXECUTE | Create tables/functions |

---

*Document Version: 1.0.0*  
*Last Updated: December 2025*  
*Author: Kenbright AI Team*
