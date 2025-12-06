"""
API Tests for IFRS 17 RAG Chatbot
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_chat_endpoint(client):
    """Test chat endpoint with a simple question."""
    response = client.post("/api/chat", json={
        "message": "What is IFRS 17?",
        "include_sources": True
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "conversation_id" in data
    assert "processing_time" in data


def test_chat_endpoint_greeting(client):
    """Test chat endpoint with a greeting."""
    response = client.post("/api/chat", json={
        "message": "Hello!",
        "include_sources": False
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data


def test_ingest_endpoint(client):
    """Test document ingestion endpoint."""
    response = client.post("/api/ingest", json={
        "refresh_all": False
    })
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "message" in data
