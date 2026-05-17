from selenium import webdriver

from selenium.webdriver.common.by import By

from selenium.webdriver.chrome.service import Service

from selenium.webdriver.chrome.options import Options

from webdriver_manager.chrome import ChromeDriverManager

import uuid
import time


def test_signup_flow():

    unique_username = f"signup_{uuid.uuid4().hex[:8]}@gmail.com"

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        driver.get("http://127.0.0.1:5000/signup")

        time.sleep(2)

        # Fill signup form
        driver.find_element(By.ID, "name").send_keys("Selenium User")

        driver.find_element(By.ID, "email").send_keys(unique_username)

        driver.find_element(By.ID, "pw").send_keys("1234")

        driver.find_element(By.ID, "pw2").send_keys("1234")

        # Submit form
        driver.find_element(
            By.CSS_SELECTOR,
            "button, input[type='submit']"
        ).click()

        time.sleep(3)

        # Verify redirect after signup
        assert "dashboard" in driver.current_url.lower()

    finally:

        driver.quit()

def test_signup_owner_flow():

    unique_username = f"owner_{uuid.uuid4().hex[:8]}@gmail.com"

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        driver.get("http://127.0.0.1:5000/signup")

        time.sleep(2)

        # Switch to owner role tab
        driver.find_element(By.ID, "tab-o").click()

        time.sleep(1)

        driver.find_element(By.ID, "name").send_keys("Selenium Owner")

        driver.find_element(By.ID, "email").send_keys(unique_username)

        driver.find_element(By.ID, "restName").send_keys("Selenium Bistro")

        driver.find_element(By.ID, "cuisine").send_keys("Italian")

        driver.find_element(By.ID, "city").send_keys("Sydney")

        driver.find_element(By.ID, "pw").send_keys("Test1234")

        driver.find_element(By.ID, "pw2").send_keys("Test1234")

        driver.find_element(By.CSS_SELECTOR, "button.submit-btn").click()

        time.sleep(3)

        assert "owner-dashboard" in driver.current_url

    finally:

        driver.quit()


def test_signup_duplicate_email_shows_error():

    import requests

    # Pre-register a user via API
    username = f"dup_{uuid.uuid4().hex[:8]}@gmail.com"

    requests.post("http://127.0.0.1:5000/api/auth/register", json={
        "name": "Original User", "username": username, "password": "Test1234", "role": "customer"
    })

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        driver.get("http://127.0.0.1:5000/signup")

        time.sleep(2)

        driver.find_element(By.ID, "name").send_keys("Duplicate User")

        driver.find_element(By.ID, "email").send_keys(username)

        driver.find_element(By.ID, "pw").send_keys("Test1234")

        driver.find_element(By.ID, "pw2").send_keys("Test1234")

        driver.find_element(By.CSS_SELECTOR, "button.submit-btn").click()

        time.sleep(2)

        # Should stay on /signup and show error
        assert "/signup" in driver.current_url

        err_msg = driver.find_element(By.ID, "errMsg")

        assert err_msg.is_displayed()

    finally:

        driver.quit()
