from selenium import webdriver

from selenium.webdriver.common.by import By

from selenium.webdriver.chrome.service import Service

from selenium.webdriver.chrome.options import Options

from webdriver_manager.chrome import ChromeDriverManager

import time


def test_login_form_elements_exist():

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        driver.get("http://127.0.0.1:5000/login")

        time.sleep(2)

        email_input = driver.find_element(By.ID, "email")

        password_input = driver.find_element(By.ID, "password")

        buttons = driver.find_elements(By.TAG_NAME, "button")

        assert email_input is not None

        assert password_input is not None

        assert len(buttons) > 0

    finally:

        driver.quit()


def test_login_invalid_credentials_shows_error():

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        driver.get("http://127.0.0.1:5000/login")

        time.sleep(2)

        driver.find_element(By.ID, "email").send_keys("nobody@nowhere.com")

        driver.find_element(By.ID, "password").send_keys("wrongpassword")

        driver.find_element(By.CSS_SELECTOR, "button.submit-btn").click()

        time.sleep(2)

        assert "/login" in driver.current_url

        err_msg = driver.find_element(By.ID, "errMsg")

        assert err_msg.is_displayed()

    finally:

        driver.quit()


def test_customer_login_redirects_to_customer_dashboard():

    import uuid, requests

    username = f"customer_{uuid.uuid4().hex[:8]}@gmail.com"

    requests.post("http://127.0.0.1:5000/api/auth/register", json={
        "name": "Test Customer", "username": username, "password": "Test1234", "role": "customer"
    })

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        driver.get("http://127.0.0.1:5000/login")

        time.sleep(2)

        driver.find_element(By.ID, "email").send_keys(username)

        driver.find_element(By.ID, "password").send_keys("Test1234")

        driver.find_element(By.CSS_SELECTOR, "button.submit-btn").click()

        time.sleep(3)

        assert "customer-dashboard" in driver.current_url

    finally:

        driver.quit()
