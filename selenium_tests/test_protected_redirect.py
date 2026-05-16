from selenium import webdriver

from selenium.webdriver.chrome.service import Service

from selenium.webdriver.chrome.options import Options

from webdriver_manager.chrome import ChromeDriverManager

import time


def test_protected_route_redirect():

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        # Try accessing protected route directly
        driver.get("http://127.0.0.1:5000/customer-dashboard")

        time.sleep(2)

        # Should redirect to login
        assert "/login" in driver.current_url

    finally:

        driver.quit()