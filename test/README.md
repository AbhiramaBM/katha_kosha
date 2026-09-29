# Selenium WebDriver Testing Guide: Kannada Katha Kosha

This directory contains automated End-to-End (E2E) browser test suites for **Kannada Katha Kosha** built with Selenium WebDriver.

---

## 🚀 Available Test Suites

| File | Language | Description |
|---|---|---|
| [`test/selenium.e2e.js`](file:///c:/Users/abhir/Music/kata%20kosha/test/selenium.e2e.js) | JavaScript (Node.js) | Full E2E suite using `selenium-webdriver` with Chrome & Edge fallback |
| [`test/selenium_test.py`](file:///c:/Users/abhir/Music/kata%20kosha/test/selenium_test.py) | Python | Python-based Selenium automation suite |

---

## 📋 What the Selenium Tests Cover

1. **Authentication & UI Rendering**:
   - Kannada brand header (`ಕನ್ನಡ ಕಥಾ ಕೋಶ`) and typography.
   - Form inputs (`#email`, `#password`, submit button).
   - Validation & error banner on invalid credentials.
   - Successful Admin authentication (`admin@example.com` / `Admin@12345`).
   - Verification of JWT tokens in browser `localStorage`.
2. **Dashboard & Visual Modes**:
   - Welcome banner with Kannada greeting (`ಸ್ವಾಗತ`).
   - Metrics cards (Authors and Stories counts).
   - Theme toggle (switching between Light and Dark mode).
3. **Authors Directory & Kannada Unicode**:
   - Navigation to `/authors`.
   - Opening the author creation modal.
   - Entry of Kannada Unicode names (e.g. `ಕುವೆಂಪು`) and metadata.
   - Saving and verifying record presence.
4. **Stories Archive**:
   - Navigation to `/stories`.
   - Real-time search filtering.
5. **Story Editor**:
   - Navigation to `/stories/new`.
   - Validating story title in Kannada and English.
6. **User Management**:
   - Verification of Admin-only access to `/users`.
7. **Logout & Protected Route Guards**:
   - Logout execution and verification of redirect to `/login`.
   - Attempted access to protected `/dashboard` while unauthenticated (redirects to `/login`).

---

## 🛠️ Prerequisites

1. **Start the Backend API Server**:
   ```bash
   npm run dev
   # Runs on http://localhost:5000
   ```

2. **Start the Frontend Vite Server**:
   ```bash
   npm run frontend
   # Runs on http://localhost:5173
   ```

---

## 🏃 Running the Tests

### Option A: Node.js (Recommended)

- **Headless Mode** (Fast, runs in background without opening window):
  ```bash
  npm run test:selenium
  ```

- **Headed / Visual Mode** (Opens Chrome/Edge window to watch automated interactions live):
  ```bash
  npm run test:selenium:headed
  ```

- **Custom Ports / URLs**:
  ```bash
  FRONTEND_URL=http://localhost:5173 BACKEND_URL=http://localhost:5000 node test/selenium.e2e.js
  ```

---

### Option B: Python

1. Install Python Selenium:
   ```bash
   pip install selenium
   ```

2. Run the test:
   ```bash
   python test/selenium_test.py
   ```

3. Run in visual (headed) mode:
   ```powershell
   $env:HEADLESS="0"; python test/selenium_test.py
   ```

---

## 📸 Failure Screenshots

If any step fails, a screenshot will automatically be captured and saved to:
`test/screenshots/`
