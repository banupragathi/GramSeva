import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_csrf_token_endpoint():
    response = client.get("/api/csrf-token")
    assert response.status_code == 200
    assert "csrfToken" in response.json()
    assert "csrf_token" in response.cookies

def test_csrf_protection_on_post():
    # Attempting POST without CSRF token header should fail 403 when cookie is present
    csrf_res = client.get("/api/csrf-token")
    csrf_cookie = csrf_res.cookies.get("csrf_token")
    
    # POST without header
    res = client.post("/api/auth/login", json={"email": "test@example.com", "password": "pass", "role": "admin"}, cookies={"csrf_token": csrf_cookie})
    assert res.status_code == 403

def test_login_cookie():
    csrf_res = client.get("/api/csrf-token")
    token = csrf_res.json()["csrfToken"]
    csrf_cookie = csrf_res.cookies.get("csrf_token")
    
    res = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "pass", "role": "admin"},
        headers={"X-CSRF-Token": token},
        cookies={"csrf_token": csrf_cookie}
    )
    assert res.status_code == 200
    assert "jwt" in res.cookies
