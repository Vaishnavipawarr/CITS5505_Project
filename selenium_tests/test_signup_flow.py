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