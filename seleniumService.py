import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def initialize_driver():
    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--incognito")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument(f"user-agent={get_random_user_agent()}")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)
    chrome_prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", chrome_prefs)

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    # Additional anti-detection steps
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
    driver.execute_script("Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});")
    driver.execute_script("Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});")
    driver.execute_script("Intl.DateTimeFormat = () => ({resolvedOptions: () => ({timeZone: 'America/New_York'})});")

    driver.set_window_position(0, 0)
    driver.set_window_size(1920, 1080)

    return driver

def get_random_user_agent():
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"
    ]
    return random.choice(user_agents)

def random_sleep():
    time.sleep(random.uniform(1, 2.5))

def type_like_human(driver, element, text):
    for char in text:
        element.send_keys(char)
        random_sleep_short()

def move_mouse_randomly(driver, element):
    actions = ActionChains(driver)
    random_offset_x = random.randint(-5, 5)
    random_offset_y = random.randint(-5, 5)
    actions.move_to_element_with_offset(element, random_offset_x, random_offset_y).perform()

    for _ in range(random.randint(1, 5)):
        step_offset_x = random.randint(-1, 1)
        step_offset_y = random.randint(-1, 1)
        actions.move_by_offset(step_offset_x, step_offset_y).perform()
        random_sleep_short()

def scroll_to_element(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)

def random_sleep_short():
    time.sleep(random.uniform(0.2, 0.7))

def perform_login(driver, wait):
    actions = ActionChains(driver)

    def enter_user_id():
        user_id_field = wait.until(EC.visibility_of_element_located((By.XPATH, "/html/body/form/div[1]/div/div[2]/main/div[2]/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/input")))
        scroll_to_element(driver, user_id_field)
        move_mouse_randomly(driver, user_id_field)
        actions.move_to_element(user_id_field).click().perform()
        type_like_human(driver, user_id_field, "redberyl")

    def enter_password():
        password_field = wait.until(EC.visibility_of_element_located((By.XPATH, "/html/body/form/div[1]/div/div[2]/main/div[2]/div/div[2]/div[2]/div/div[3]/div[1]/div/div[2]/div/input")))
        scroll_to_element(driver, password_field)
        move_mouse_randomly(driver, password_field)
        actions.move_to_element(password_field).click().perform()
        type_like_human(driver, password_field, "yD7?ddG0")

    def click_next_button():
        next_button = wait.until(EC.visibility_of_element_located((By.XPATH, "/html/body/form/div[1]/div/div[2]/main/div[2]/div/div[2]/div[2]/div/div[3]/div[2]/button")))
        scroll_to_element(driver, next_button)
        move_mouse_randomly(driver, next_button)
        actions.move_to_element(next_button).click().perform()
        random_sleep()

    def click_next_button1():
        next_button1 = wait.until(EC.visibility_of_element_located((By.XPATH, "/html/body/form/div[1]/div/div[2]/main/div[2]/div[1]/div[2]/div[2]/ul/li[1]/a/span[2]")))
        scroll_to_element(driver, next_button1)
        move_mouse_randomly(driver, next_button1)
        actions.move_to_element(next_button1).click().perform()
        random_sleep()

    def click_next_button2():
        next_button2 = wait.until(EC.visibility_of_element_located((By.XPATH, "/html/body/form/div[1]/div/div[2]/main/div[2]/div/div[2]/div[2]/ul/li[2]/a/span[2]")))
        scroll_to_element(driver, next_button2)
        move_mouse_randomly(driver, next_button2)
        actions.move_to_element(next_button2).click().perform()

    def enter_name():
        name_field = wait.until(EC.visibility_of_element_located((By.XPATH, "/html/body/form/div[1]/div/div[2]/main/div[2]/div/div[2]/div[2]/div/div/div/div/div[2]/div[1]/input")))
        scroll_to_element(driver, name_field)
        move_mouse_randomly(driver, name_field)
        actions.move_to_element(name_field).click().perform()
        type_like_human(driver, name_field, "505050jar llc")

    actions_list = [enter_user_id, enter_password, click_next_button, click_next_button1, click_next_button2, enter_name]
    for action in actions_list:
        action()

def main():
    driver = None
    try:
        driver = initialize_driver()
        driver.get("https://filings.dos.ny.gov/ords/corpanc/r/ecorp/login_desktop")
        driver.maximize_window()
        time.sleep(3)

        user_agent = driver.execute_script("return navigator.userAgent;")
        print("User-Agent:", user_agent)

        random_sleep()

        wait = WebDriverWait(driver, 10)
        perform_login(driver, wait)
    except Exception as e:
        print(e)
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    main()
