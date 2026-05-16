import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mainApp import app


def test_health_endpoint():

    client = app.test_client()

    response = client.get('/api/health')

    assert response.status_code == 200

    data = response.get_json()

    assert data["success"] is True

    assert data["message"] == "Backend server is running"