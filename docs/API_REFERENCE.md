# API Reference

## Base URL
```
http://localhost:8000
```

---

## Endpoints

### Health Check
```http
GET /api/health
```

**Response**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "vector_store_ready": true,
  "documents_count": 150
}
```

---

### Chat
```http
POST /api/chat
```

**Request Body**
```json
{
  "message": "What is the Contractual Service Margin under IFRS 17?",
  "conversation_id": "optional-uuid-for-follow-up",
  "include_sources": true
}
```

**Response**
```json
{
  "answer": "The Contractual Service Margin (CSM) under IFRS 17 represents...",
  "sources": [
    {
      "content": "The contractual service margin is a component of the asset or liability...",
      "source": "ifrs-17-insurance-contracts.pdf",
      "page": 24,
      "relevance_score": 0.92
    }
  ],
  "conversation_id": "abc123-uuid",
  "processing_time": 1.45
}
```

---

### Document Ingestion
```http
POST /api/ingest
```

**Request Body**
```json
{
  "document_path": "/path/to/specific/file.pdf",
  "refresh_all": false
}
```

**Response**
```json
{
  "success": true,
  "documents_processed": 5,
  "chunks_created": 245,
  "message": "Successfully ingested 5 documents"
}
```

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "detail": "Error message here"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid input |
| 500 | Internal Server Error |

---

## Frontend Integration Example

```javascript
// src/services/chatbotService.js

const API_BASE = process.env.REACT_APP_CHATBOT_API || 'http://localhost:8000';

export const sendMessage = async (message, conversationId = null) => {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      include_sources: true,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
};
```

---

## WebSocket (Future Enhancement)

For real-time streaming responses:
```
ws://localhost:8000/ws/chat
```

**Message Format**
```json
{
  "type": "message",
  "content": "Your question here",
  "conversation_id": "uuid"
}
```

**Stream Response**
```json
{
  "type": "token",
  "content": "partial response text"
}
```
