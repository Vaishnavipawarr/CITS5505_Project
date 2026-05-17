import sys
import os
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mainApp import app


def test_login_endpoint():

    client = app.test_client()

    unique_username = f"login_{uuid.uuid4().hex[:8]}@gmail.com"

    # Register test user first
    client.post('/api/auth/register', json={
        "name": "Login Test",
        "username": unique_username,
        "password": "1234",
        "role": "customer"
    })

    # Attempt login
    response = client.post('/api/auth/login', json={
        "username": unique_username,
        "password": "1234",
        "role": "customer"
    })

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True

    assert data["message"] == "Login successful"

    assert data["user"]["username"] == unique_username