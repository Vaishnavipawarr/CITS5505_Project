from selenium import webdriver

from selenium.webdriver.common.by import By

from selenium.webdriver.chrome.service import Service

from selenium.webdriver.chrome.options import Options

from webdriver_manager.chrome import ChromeDriverManager

import uuid
import requests
import time


def test_logout_flow():

    unique_username = f"logout_{uuid.uuid4().hex[:8]}@gmail.com"

    # Create user
    requests.post(
        "http://127.0.0.1:5000/api/auth/register",
        json={
            "name": "Logout User",
            "username": unique_username,
            "password": "1234",
            "role": "customer"
        }
    )

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        # Open login page
        driver.get("http://127.0.0.1:5000/login")

        time.sleep(2)

        # Login
        driver.find_element(By.ID, "username").send_keys(unique_username)

        driver.find_element(By.ID, "password").send_keys("1234")

        driver.find_element(
            By.CSS_SELECTOR,
            "button, input[type='submit']"
        ).click()

        time.sleep(3)

        # Open logout route
        driver.get("http://127.0.0.1:5000/logout")

        time.sleep(2)

        # Try accessing protected route again
        driver.get("http://127.0.0.1:5000/customer-dashboard")

        time.sleep(2)

        # Should redirect back to login
        assert "/login" in driver.current_url

    finally:

        driver.quit()