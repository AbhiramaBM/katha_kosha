# Selenium Testing Guide: Kannada Katha Kosha

This directory contains automated End-to-End (E2E) test suites for **Kannada Katha Kosha** built with Selenium WebDriver, mapped 1-to-1 against all specifications in [`kannada-katha-kosha-requirements.md`](file:///c:/Users/abhir/Music/kata%20kosha/kannada-katha-kosha-requirements.md).

---

## 🚀 Available Test Suites

| File | Language | Execution Mode | Description |
|---|---|---|---|
| [`test/selenium.e2e.js`](file:///c:/Users/abhir/Music/kata%20kosha/test/selenium.e2e.js) | JavaScript (Node.js) | Headless & Visual (`--headed`) | Comprehensive 26-requirement validation suite covering all Acceptance Checklist items & business rules |
| [`test/selenium_test.py`](file:///c:/Users/abhir/Music/kata%20kosha/test/selenium_test.py) | Python | Headless & Visual (`HEADLESS=0`) | Python Selenium companion test script |

---

## 📋 Full Requirements & Acceptance Checklist Mapping

| Requirement / Checklist Item | Specification Section | Selenium Test Suite Step | Status |
|---|---|---|:---:|
| **Health Check & DB Ping** | Section 11 Non-Functional | Pre-flight: `GET /health` (`status: ok, database: connected`) | ✅ PASS |
| **Security Headers** | Section 11 Non-Functional | Pre-flight: Helmet & CORS response headers | ✅ PASS |
| **Branding & Kannada UTF-8** | Section 1 & 2 | Phase 1, Req 1: DOM branding & Kannada typography verification | ✅ PASS |
| **Invalid Login Rejection** | Section 6.5 & 7.1 | Phase 1, Req 2: Invalid credentials rejection & error alert | ✅ PASS |
| **Checklist Item 1 (Admin Login)** | Section 3 & Checklist 1 | Phase 1, Req 3: Admin logs in with seeded account (`admin@example.com`) | ✅ PASS |
| **Theme & Metrics** | Section 11 | Phase 1, Req 4: Dashboard stats rendering & Dark/Light theme toggle | ✅ PASS |
| **Checklist Item 1 (Create Editor)** | Section 3, 7.2 & Checklist 1 | Phase 2, Req 5: Admin creates Editor account via `POST /users` | ✅ PASS |
| **Checklist Item 1 (Editor Login)** | Section 3 & Checklist 1 | Phase 2, Req 6: Editor logs in and navigates dashboard | ✅ PASS |
| **Checklist Item 2 (RBAC UI)** | Section 3 & Checklist 2 | Phase 2, Req 7: Editor denied access to `/users` UI (403 forbidden) | ✅ PASS |
| **Checklist Item 2 (RBAC API)** | Section 3 & Checklist 2 | Phase 2, Req 8: Editor `GET /api/v1/users` strictly rejected with 403 | ✅ PASS |
| **Checklist Item 2 & Rule 8 (UI)** | Section 3, Rule 8 & Checklist 2 | Phase 2, Req 9: Delete buttons strictly hidden from Editor in UI | ✅ PASS |
| **Checklist Item 2 & Rule 8 (API)** | Section 3, Rule 8 & Checklist 2 | Phase 2, Req 10: Editor API `DELETE /authors` & `DELETE /stories` return 403 | ✅ PASS |
| **Checklist Item 4 (Kannada Unicode)** | Section 4, 7.3 & Checklist 4 | Phase 3, Req 11: Author created with Kannada Unicode (`ಕುವೆಂಪು`) without corruption | ✅ PASS |
| **Checklist Item 5 & Rule 1** | Section 5 & Checklist 5 | Phase 4, Req 12: Story creation requires author; missing/invalid `author_id` blocked | ✅ PASS |
| **Checklist Item 6 & Rule 2, 5** | Section 5 & Checklist 6 | Phase 4, Req 13: Story with pasted text + references array created | ✅ PASS |
| **Checklist Item 6, 10 & Rule 3** | Section 5, 8 & Checklist 6, 10 | Phase 4, Req 14: Story with uploaded PDF created | ✅ PASS |
| **Checklist Item 10 & Rule 8** | Section 8 & Checklist 10 | Phase 4, Req 15: Non-PDF uploads rejected with 415 (magic bytes check) | ✅ PASS |
| **Checklist Item 7 & Rule 5** | Section 5 & Checklist 7 | Phase 4, Req 16: Adding/removing/updating references array in one update call | ✅ PASS |
| **Search & Pagination** | Section 1.17 & 11 | Phase 4, Req 17: Real-time search filter in Stories Archive | ✅ PASS |
| **Admin Privilege Switch** | Section 3 | Phase 5, Req 18: Editor logs out; Admin logs in with delete permissions | ✅ PASS |
| **Checklist Item 8 & Rule 6** | Section 5, Rule 6 & Checklist 8 | Phase 5, Req 19: Author with active stories deletion blocked with 409 Conflict | ✅ PASS |
| **Checklist Item 9 & Rule 7** | Section 5, Rule 7 & Checklist 9 | Phase 5, Req 20: Stories soft-deleted and excluded from list/detail endpoints | ✅ PASS |
| **Rule 6 & 7 (Author Cleanup)** | Section 5, Rule 6 & 7 | Phase 5, Req 21: Author soft-deleted after all linked stories are soft-deleted | ✅ PASS |
| **Business Rule 9 (Disabled User)** | Section 5, Rule 9 | Phase 5, Req 22: Disabled user (`is_active = 0`) cannot log in; tokens revoked | ✅ PASS |
| **Checklist Item 3 (Token Rotation)**| Section 6.3 & Checklist 3 | Phase 5, Req 23: Refresh token rotation; reused old token rejected (401) | ✅ PASS |
| **Protected Route Shielding** | Section 6.4 | Phase 5, Req 24: Unauthenticated access redirected to `/login` | ✅ PASS |

---

## 🏃 Running the Tests

- **Headless Mode** (Fast, standard automated test):
  ```bash
  npm run test:selenium
  ```

- **Headed / Visual Mode** (Opens a visible browser window):
  ```bash
  npm run test:selenium:headed
  ```

- **Python Suite**:
  ```bash
  python test/selenium_test.py
  ```
