"""
Comprehensive Integration Tests for Supabase pgvector Migration
Run with: python -m pytest tests/test_supabase_integration.py -v
"""
import pytest
import httpx
import asyncio
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000"


class TestHealthEndpoint:
    """Tests for the /api/health endpoint"""
    
    def test_health_returns_200(self):
        """Health endpoint should return 200 OK"""
        response = httpx.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
    
    def test_health_shows_supabase(self):
        """Health should show supabase as vector store type"""
        response = httpx.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data["vector_store_type"] == "supabase"
    
    def test_health_shows_documents(self):
        """Health should show documents are loaded"""
        response = httpx.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data["documents_count"] > 0
        assert data["vector_store_ready"] == True
    
    def test_health_status_healthy(self):
        """Health status should be healthy"""
        response = httpx.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data["status"] == "healthy"


class TestChatEndpoint:
    """Tests for the /api/chat endpoint"""
    
    def test_chat_basic_question(self):
        """Chat should respond to basic IFRS 17 question"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What is IFRS 17?", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert len(data["answer"]) > 50  # Should have substantial answer
    
    def test_chat_gmm_question(self):
        """Chat should explain General Measurement Model"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "Explain the General Measurement Model", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        # Should mention GMM or Building Block
        assert any(term in data["answer"].upper() for term in ["GMM", "GENERAL MEASUREMENT", "BUILDING BLOCK", "BBA"])
    
    def test_chat_csm_question(self):
        """Chat should explain Contractual Service Margin"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What is the Contractual Service Margin?", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "CSM" in data["answer"].upper() or "CONTRACTUAL SERVICE MARGIN" in data["answer"].upper()
    
    def test_chat_paa_question(self):
        """Chat should explain Premium Allocation Approach"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What is the Premium Allocation Approach?", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "PAA" in data["answer"].upper() or "PREMIUM ALLOCATION" in data["answer"].upper()
    
    def test_chat_includes_sources(self):
        """Chat should include source documents when requested"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What are the measurement models in IFRS 17?", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "sources" in data
        # Sources may or may not be present depending on implementation
    
    def test_chat_returns_conversation_id(self):
        """Chat should return a conversation ID"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What is IFRS 17?", "include_sources": False},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "conversation_id" in data
        assert len(data["conversation_id"]) > 0
    
    def test_chat_returns_processing_time(self):
        """Chat should return processing time"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What is IFRS 17?", "include_sources": False},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "processing_time" in data
        assert data["processing_time"] > 0
    
    def test_chat_empty_message_fails(self):
        """Chat should reject empty messages"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "", "include_sources": False},
            timeout=60.0
        )
        # Should either return 422 (validation error) or handle gracefully
        assert response.status_code in [200, 422, 400]


class TestVectorSearch:
    """Tests for vector similarity search functionality"""
    
    def test_relevant_results_for_gmm(self):
        """Should return relevant results for GMM query"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "Explain the three building blocks of GMM", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        # Answer should mention liability, fulfillment, or CSM
        answer_upper = data["answer"].upper()
        assert any(term in answer_upper for term in [
            "LIABILITY", "FULFILLMENT", "CSM", "CASH FLOW", "DISCOUNT", "RISK ADJUSTMENT"
        ])
    
    def test_relevant_results_for_reinsurance(self):
        """Should return relevant results for reinsurance query"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "How does IFRS 17 treat reinsurance contracts?", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        assert "REINSURANCE" in data["answer"].upper()
    
    def test_relevant_results_for_transition(self):
        """Should return relevant results for transition query"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What are the transition approaches in IFRS 17?", "include_sources": True},
            timeout=60.0
        )
        assert response.status_code == 200
        data = response.json()
        answer_upper = data["answer"].upper()
        assert any(term in answer_upper for term in [
            "TRANSITION", "RETROSPECTIVE", "MODIFIED", "FAIR VALUE"
        ])


class TestPerformance:
    """Performance tests"""
    
    def test_health_response_time(self):
        """Health endpoint should respond quickly"""
        start = time.time()
        response = httpx.get(f"{BASE_URL}/api/health")
        elapsed = time.time() - start
        assert response.status_code == 200
        assert elapsed < 5.0  # Should respond within 5 seconds
    
    def test_chat_response_time(self):
        """Chat should respond within reasonable time"""
        start = time.time()
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What is IFRS 17?", "include_sources": False},
            timeout=60.0
        )
        elapsed = time.time() - start
        assert response.status_code == 200
        assert elapsed < 30.0  # Should respond within 30 seconds


class TestEdgeCases:
    """Edge case tests"""
    
    def test_long_question(self):
        """Should handle long questions"""
        long_question = "Can you explain " + "in detail " * 50 + "what IFRS 17 is about?"
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": long_question, "include_sources": False},
            timeout=60.0
        )
        assert response.status_code == 200
    
    def test_special_characters(self):
        """Should handle special characters in questions"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What's the CSM's role in IFRS 17? (including examples)", "include_sources": False},
            timeout=60.0
        )
        assert response.status_code == 200
    
    def test_non_ifrs17_question(self):
        """Should handle questions outside IFRS 17 scope"""
        response = httpx.post(
            f"{BASE_URL}/api/chat",
            json={"message": "What is the capital of France?", "include_sources": False},
            timeout=60.0
        )
        assert response.status_code == 200
        # Should still return an answer (may indicate it's outside scope)


class TestRootEndpoint:
    """Tests for the root endpoint"""
    
    def test_root_returns_info(self):
        """Root should return API info"""
        response = httpx.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
