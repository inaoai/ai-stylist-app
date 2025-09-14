import pytest
import requests
import uuid

API_URL = "http://localhost:8000"  # adjust if needed
PROTECTED_ENDPOINT = "/users/me"   # or "/me" depending on your backend



def test_register_login_and_token_usage():
    # Generate unique user
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    username = f"user_{uuid.uuid4().hex[:6]}"
    password = "securepassword"

    # ---- Register ----
    response = requests.post(
        f"{API_URL}/register",
        json={
            "email": email,
            "username": username,
            "password": password
        }
    )
    assert response.status_code in [200, 201], response.text
    body = response.json()
    assert "message" in body
    assert "registered" in body["message"].lower()

    # ---- Login ----
    response = requests.post(
        f"{API_URL}/login",
        json={
            "email": email,
            "password": password
        }
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data

    # Extract token
    token = data["access_token"]

    # ---- Use token in an authenticated request ----
    headers = {"Authorization": f"Bearer {token}"}
    protected_response = requests.get(f"{API_URL}{PROTECTED_ENDPOINT}", headers=headers)
    assert protected_response.status_code == 200, protected_response.text
    profile_data = protected_response.json()
    assert profile_data.get("email") == email
