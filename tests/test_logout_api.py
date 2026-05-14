import sys
import os
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mainApp import app


def test_logout_endpoint():

    client = app.test_client()

    unique_username = f"logout_{uuid.uuid4().hex[:8]}@gmail.com"

    # Register user
    client.post('/api/auth/register', json={
        "name": "Logout Test",
        "username": unique_username,
        "password": "1234",
        "role": "customer"
    })

    # Login user
    client.post('/api/auth/login', json={
        "username": unique_username,
        "password": "1234",
        "role": "customer"
    })

    # Logout user
    response = client.get('/logout')

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True

    assert data["message"] == "Logged out successfully"