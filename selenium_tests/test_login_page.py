from selenium import webdriver

from selenium.webdriver.chrome.service import Service

from selenium.webdriver.chrome.options import Options

from webdriver_manager.chrome import ChromeDriverManager

import time


def test_login_page_loads():

    chrome_options = Options()

    chrome_options.add_argument("--start-maximized")

    chrome_options.add_argument("--disable-dev-shm-usage")

    chrome_options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:

        driver.get("http://127.0.0.1:5000/login")

        time.sleep(2)

        assert "login" in driver.page_source.lower()

    finally:

        driver.quit()