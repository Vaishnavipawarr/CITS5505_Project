import sys
import os
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mainApp import app


def test_customer_dashboard_requires_authentication():

    client = app.test_client()

    response = client.get('/customer-dashboard')

    # Protected route should redirect
    assert response.status_code == 302

    assert '/login' in response.location


def test_authenticated_customer_can_access_dashboard():

    client = app.test_client()

    unique_username = f"protected_{uuid.uuid4().hex[:8]}@gmail.com"

    # Register customer
    client.post('/api/auth/register', json={
        "name": "Protected Test",
        "username": unique_username,
        "password": "1234",
        "role": "customer"
    })

    # Login customer
    client.post('/api/auth/login', json={
        "username": unique_username,
        "password": "1234",
        "role": "customer"
    })

    # Access protected dashboard
    response = client.get('/customer-dashboard')

    assert response.status_code == 200