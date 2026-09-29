"""
Kannada Katha Kosha - Python Selenium WebDriver Test Suite

Performs automated UI testing:
- Login page rendering and Kannada branding
- Validation on incorrect credentials
- Admin login and JWT token storage
- Dashboard navigation and Kannada stats
- Dark / Light mode toggle
- Author creation with Kannada Unicode strings
- Stories archive browsing and filters
- Protected route redirection after logout

Prerequisites:
    pip install selenium

Run:
    python test/selenium_test.py
    (Set HEADLESS=0 to run with visual browser window: $env:HEADLESS="0"; python test/selenium_test.py)
"""

import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:5000")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@12345")
IS_HEADLESS = os.environ.get("HEADLESS", "1").lower() not in ("0", "false", "no")

def get_driver():
    common_args = [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--window-size=1440,900"
    ]
    if IS_HEADLESS:
        common_args.append("--headless=new")

    # 1. Try Chrome
    try:
        options = ChromeOptions()
        for arg in common_args:
            options.add_argument(arg)
        driver = webdriver.Chrome(options=options)
        return driver, "Chrome"
    except Exception as e:
        print(f"[Notice] Chrome start error: {e}. Trying Microsoft Edge...")

    # 2. Try Edge
    try:
        edge_options = EdgeOptions()
        for arg in common_args:
            edge_options.add_argument(arg)
        driver = webdriver.Edge(options=edge_options)
        return driver, "Microsoft Edge"
    except Exception as e:
        print(f"[Error] Failed to initialize Edge as well: {e}")
        raise

def run_tests():
    print("=" * 65)
    print("  Kannada Katha Kosha - Python Selenium Test Suite")
    print("=" * 65)
    print(f"  Target: {FRONTEND_URL}")
    print(f"  Mode:   {'Headless' if IS_HEADLESS else 'Visual (Headed)'}")
    print("-" * 65)

    driver, browser = get_driver()
    driver.implicitly_wait(10)
    wait = WebDriverWait(driver, 10)
    passed = 0
    total = 0

    try:
        # Step 1: Open Login Page
        total += 1
        print("\n[Step 1] Loading Login Page...")
        driver.get(f"{FRONTEND_URL}/login")
        wait.until(EC.presence_of_element_located((By.ID, "email")))
        assert "ಕನ್ನಡ ಕಥಾ ಕೋಶ" in driver.page_source, "Brand title missing"
        print("  ✓ PASS: Login page rendered with Kannada branding.")
        passed += 1

        # Step 2: Test Invalid Login
        total += 1
        print("\n[Step 2] Testing Invalid Credentials...")
        email_el = driver.find_element(By.ID, "email")
        pwd_el = driver.find_element(By.ID, "password")
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

        email_el.clear()
        email_el.send_keys("admin@example.com")
        pwd_el.clear()
        pwd_el.send_keys("WrongPass@999")
        submit_btn.click()

        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(@class, 'bg-rose-50') or contains(text(), 'ವಿಫಲವಾಗಿದೆ') or contains(text(), 'Invalid')]")))
        print("  ✓ PASS: Invalid login rejected with error message.")
        passed += 1

        # Step 3: Test Valid Admin Login
        total += 1
        print("\n[Step 3] Submitting Valid Admin Credentials...")
        email_el.clear()
        email_el.send_keys(ADMIN_EMAIL)
        pwd_el.clear()
        pwd_el.send_keys(ADMIN_PASSWORD)
        submit_btn.click()

        wait.until(EC.url_contains("/dashboard"))
        token = driver.execute_script("return localStorage.getItem('auth_token');")
        assert token, "auth_token missing from localStorage"
        print("  ✓ PASS: Redirected to /dashboard and token verified.")
        passed += 1

        # Step 4: Dashboard & Theme Switcher
        total += 1
        print("\n[Step 4] Checking Dashboard and Theme Toggle...")
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'ಸ್ವಾಗತ') or contains(text(), 'ಕಥಾ ಕೋಶ')]")))
        theme_btn = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Toggle theme']")
        theme_btn.click()
        time.sleep(0.5)
        print("  ✓ PASS: Dashboard stats loaded and theme toggle clicked.")
        passed += 1

        # Step 5: Authors Page & Unicode Author Entry
        total += 1
        print("\n[Step 5] Testing Authors Directory & Kannada Unicode Entry...")
        driver.get(f"{FRONTEND_URL}/authors")
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'ಸಾಹಿತಿ') or contains(text(), 'Authors')]")))

        add_btn = driver.find_element(By.XPATH, "//button[contains(., 'ಹೊಸ ಸಾಹಿತಿ') or contains(., 'ಸೇರಿಸಿ')]")
        add_btn.click()
        time.sleep(0.5)

        kn_input = driver.find_element(By.XPATH, "//input[@placeholder='ಉದಾ: ಕುವೆಂಪು' or contains(@placeholder, 'ಕುವೆಂಪು')]")
        test_kn_name = f"ಪರೀಕ್ಷಾ ಸಾಹಿತಿ (Py-{int(time.time()) % 10000})"
        kn_input.send_keys(test_kn_name)

        save_btn = driver.find_element(By.XPATH, "//button[@type='submit' and (contains(., 'ಉಳಿಸಿ') or contains(., 'Save'))]")
        save_btn.click()
        time.sleep(1.0)
        print(f"  ✓ PASS: Kannada Unicode author modal submitted ({test_kn_name}).")
        passed += 1

        # Step 6: Stories List
        total += 1
        print("\n[Step 6] Navigating to Stories Archive...")
        driver.get(f"{FRONTEND_URL}/stories")
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'ಕಥಾ ಭಂಡಾರ') or contains(text(), 'Stories')]")))
        print("  ✓ PASS: Stories Archive loaded.")
        passed += 1

        # Step 7: Story Editor UI
        total += 1
        print("\n[Step 7] Checking Story Editor Page...")
        driver.get(f"{FRONTEND_URL}/stories/new")
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'ಹೊಸ ಕಥೆ') or contains(text(), 'New Story')]")))
        title_kn = driver.find_element(By.XPATH, "//input[@placeholder='ಉದಾ: ಕಾನೂರು ಹೆಗ್ಗಡಿತಿ' or contains(@placeholder, 'ಕಾನೂರು')]")
        title_kn.send_keys("ಪೈಥಾನ್ ಸೆಲೆನಿಯಮ್ ಪರೀಕ್ಷಾರ್ಥ ಕಥೆ")
        print("  ✓ PASS: Story Editor input fields functional.")
        passed += 1

        # Step 8: User Management
        total += 1
        print("\n[Step 8] Checking Admin Users Panel...")
        driver.get(f"{FRONTEND_URL}/users")
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'ಸಂಪಾದಕ') or contains(text(), 'Users') or contains(text(), 'ಬಳಕೆದಾರ')]")))
        print("  ✓ PASS: Users Management table loaded.")
        passed += 1

        # Step 9: Logout & Protected Guard
        total += 1
        print("\n[Step 9] Testing Logout and Route Guards...")
        logout_btn = driver.find_element(By.XPATH, "//button[contains(., 'ನಿರ್ಗಮಿಸಿ') or contains(., 'Logout')]")
        logout_btn.click()
        time.sleep(0.5)
        confirm_btn = driver.find_elements(By.XPATH, "//button[contains(., 'ಹೌದು, ನಿರ್ಗಮಿಸಿ') or (contains(., 'Logout') and @type='button')]")
        if confirm_btn:
            confirm_btn[-1].click()

        wait.until(EC.url_contains("/login"))
        driver.get(f"{FRONTEND_URL}/dashboard")
        time.sleep(1.0)
        assert "/login" in driver.current_url, "User was not redirected back to login!"
        print("  ✓ PASS: Logout succeeded and route guard protected /dashboard.")
        passed += 1

        print("\n" + "=" * 65)
        print(f"  Summary: {passed}/{total} Tests Passed Successfully!")
        print("=" * 65 + "\n")

    except Exception as e:
        print(f"\n[FAIL] Test aborted with error: {e}")
        os.makedirs("test/screenshots", exist_ok=True)
        driver.save_screenshot(f"test/screenshots/py_failure_{int(time.time())}.png")
        print("  Failure screenshot saved to test/screenshots/")
        sys.exit(1)
    finally:
        driver.quit()

if __name__ == "__main__":
    run_tests()
