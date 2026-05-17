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

        username_input = driver.find_element(By.ID, "username")

        password_input = driver.find_element(By.ID, "password")

        buttons = driver.find_elements(By.TAG_NAME, "button")

        assert username_input is not None

        assert password_input is not None

        assert len(buttons) > 0

    finally:

        driver.quit()