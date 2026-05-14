import sys
import os
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mainApp import app


def test_register_endpoint():

    client = app.test_client()

    unique_username = f"test_{uuid.uuid4().hex[:8]}@gmail.com"

    response = client.post('/api/auth/register', json={
        "name": "Test User",
        "username": unique_username,
        "password": "1234",
        "role": "customer"
    })

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True

    assert data["message"] == "Registration successful"

    assert data["user"]["username"] == unique_username