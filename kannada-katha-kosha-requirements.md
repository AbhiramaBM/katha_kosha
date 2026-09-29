# Kannada Katha Kosha: Backend Requirements (v1.0)

> A backend for a Kannada story repository. Admin/Editor users log in, create **Authors**, then create **Stories** linked to those authors. Stories hold pasted text or an uploaded PDF, plus any number of reference links (reviews, etc.).

---

## 1. Scope

| In scope (v1) | Out of scope (later) |
|---|---| 
| Login for Admin & Editor (JWT + refresh token) | Frontend / admin panel UI |
| Admin manages Editor accounts | Public reader website / app |
| Author CRUD | Multiple authors per story |
| Story CRUD linked to one author | Comments, ratings, audio, translations |
| Story content: pasted text **or** PDF | Full-text search engine (Elasticsearch, etc.) |
| Multiple reference links per story (name + URL) | Email-based password reset |
| Search, filter, pagination, soft delete | |

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express.js |
| Database | MySQL 8 (charset `utf8mb4`, collation `utf8mb4_unicode_ci`, required for Kannada) |
| Query layer | `mysql2` with a query builder (Knex) **or** Sequelize; the developer may pick one, but migrations are mandatory |
| Auth | JWT access token (15 min) + refresh token (7 days), `bcrypt` (cost 12) |
| Validation | `zod` or `joi` |
| Uploads | `multer` (memory storage) → storage driver |
| File storage | **Local disk in development, Cloudflare R2 in production** (S3-compatible; free tier ~10 GB) |
| Security | `helmet`, `cors`, `express-rate-limit` |
| Logging | `pino` or `morgan` |
| Docs / testing | Postman collection + `README.md` |

**Storage driver rule:** build a small `storage` module with two drivers (`local`, `r2`), switched by `STORAGE_DRIVER` in `.env`. The developer works only with `local`. No cloud account is needed for local work. R2 will be configured at deployment.

---

## 3. Roles & Permissions

| Action | Admin | Editor |
|---|:---:|:---:|
| Login / change own password | ✅ | ✅ |
| Create / list / disable Editor accounts | ✅ | ❌ |
| Create / edit Authors | ✅ | ✅ |
| Create / edit Stories (incl. PDF & references) | ✅ | ✅ |
| Delete Authors / Stories (soft delete) | ✅ | ❌ |
| View all data | ✅ | ✅ |

There is **no public signup**. The first Admin is created by a seed script.

---

## 4. Data Model (MySQL)

```sql
CREATE TABLE users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  CHAR(64) NOT NULL UNIQUE,        -- SHA-256 of the token; never store raw
  expires_at  DATETIME NOT NULL,
  revoked_at  DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE authors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_kn       VARCHAR(190) NOT NULL,          -- Kannada name (required)
  name_en       VARCHAR(190) NULL,              -- English / transliterated name
  bio           TEXT NULL,
  photo_url     VARCHAR(500) NULL,
  photo_key     VARCHAR(500) NULL,              -- storage key, for deletion
  birth_year    SMALLINT NULL,
  death_year    SMALLINT NULL,
  place         VARCHAR(190) NULL,              -- birthplace / hometown
  created_by    BIGINT UNSIGNED NOT NULL,
  updated_by    BIGINT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL,                  -- soft delete
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_authors_name_kn (name_kn),
  INDEX idx_authors_name_en (name_en),
  INDEX idx_authors_deleted (deleted_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE stories (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id      BIGINT UNSIGNED NOT NULL,      -- one story → one author
  title_kn       VARCHAR(255) NOT NULL,
  title_en       VARCHAR(255) NULL,
  genre          VARCHAR(100) NULL,             -- free text in v1
  language       VARCHAR(10) NOT NULL DEFAULT 'kn',
  published_year SMALLINT NULL,
  summary        TEXT NULL,
  content_type   ENUM('text','pdf') NOT NULL,
  content_text   LONGTEXT NULL,                 -- used when content_type = 'text'
  pdf_url        VARCHAR(500) NULL,             -- used when content_type = 'pdf'
  pdf_key        VARCHAR(500) NULL,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_by     BIGINT UNSIGNED NOT NULL,
  updated_by     BIGINT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME NULL,
  FOREIGN KEY (author_id)  REFERENCES authors(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_stories_author (author_id),
  INDEX idx_stories_title_kn (title_kn),
  INDEX idx_stories_status (status),
  INDEX idx_stories_deleted (deleted_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE story_references (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  story_id    BIGINT UNSIGNED NOT NULL,
  name        VARCHAR(190) NOT NULL,            -- e.g. "Review in Prajavani"
  url         VARCHAR(1000) NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  INDEX idx_refs_story (story_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Relationships:** `authors 1 ── * stories 1 ── * story_references`

---

## 5. Business Rules

1. A story **must** have an existing, non-deleted author (`author_id`).
2. `content_type = 'text'` requires `content_text` (non-empty) and `pdf_url` must be null.
3. `content_type = 'pdf'` requires an uploaded PDF and `content_text` must be null.
4. Switching content type on update clears the other field (and deletes the old PDF from storage).
5. References are managed as an **array on the story**. On update, the array **replaces** all existing references. Max 20 per story. `name` is required, `url` must be a valid `http(s)` URL.
6. An author **cannot be deleted** while they have non-deleted stories (return `409`).
7. Deletes are **soft** (`deleted_at`). All list and get queries exclude soft-deleted rows.
8. Editors cannot delete. Only Admins can.
9. A disabled user (`is_active = 0`) cannot log in, and all their refresh tokens are revoked.
10. All text fields must support Kannada Unicode end to end (DB, API, JSON).

---

## 6. Authentication Flow

1. `POST /auth/login` returns `accessToken` (15 min) and `refreshToken` (7 days).
2. The client sends `Authorization: Bearer <accessToken>` on every request.
3. When the access token expires, `POST /auth/refresh` **rotates** the token: the old refresh token is revoked and a new pair is issued.
4. `POST /auth/logout` revokes the refresh token.
5. Refresh tokens are stored **hashed** (SHA-256). Reuse of a revoked token returns `401`.
6. Login rate limit: 5 attempts per 15 minutes per IP + email.
7. Password rules: minimum 8 characters, at least 1 letter and 1 number.

---

## 7. API Specification

**Base URL:** `/api/v1` · **Format:** JSON (`multipart/form-data` for uploads)

**Standard success response**
```json
{ "success": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 87 } }
```
**Standard error response**
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "title_kn is required", "details": [] } }
```

| HTTP | When |
|---|---|
| 400 | Validation error |
| 401 | Missing / invalid / expired token |
| 403 | Role not allowed |
| 404 | Record not found |
| 409 | Conflict (duplicate email, author has stories) |
| 413 | File too large |
| 415 | Unsupported file type |
| 429 | Rate limit exceeded |

### 7.1 Auth

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Email + password → tokens |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | Auth | Revoke refresh token |
| GET | `/auth/me` | Auth | Current user profile |
| POST | `/auth/change-password` | Auth | Needs `currentPassword`, `newPassword` |

### 7.2 Users (Admin only)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/users` | Create Editor (or Admin): `name`, `email`, `password`, `role` |
| GET | `/users` | List users (paginated) |
| PATCH | `/users/:id` | Update `name`, `role`, `is_active` |
| POST | `/users/:id/reset-password` | Admin sets a new password |

### 7.3 Authors

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/authors` | Admin, Editor | Create author |
| GET | `/authors` | Admin, Editor | List. Query: `q`, `page`, `limit`, `sort` |
| GET | `/authors/:id` | Admin, Editor | Author detail + story count |
| PATCH | `/authors/:id` | Admin, Editor | Update author |
| POST | `/authors/:id/photo` | Admin, Editor | Upload photo (`multipart`, field `photo`) |
| GET | `/authors/:id/stories` | Admin, Editor | Stories of this author |
| DELETE | `/authors/:id` | Admin | Soft delete (see rule 6) |

**Create author: request**
```json
{
  "name_kn": "ಕುವೆಂಪು",
  "name_en": "Kuvempu",
  "bio": "…",
  "birth_year": 1904,
  "death_year": 1994,
  "place": "Kuppalli"
}
```

### 7.4 Stories

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/stories` | Admin, Editor | Create story (JSON for text, `multipart` for PDF) |
| GET | `/stories` | Admin, Editor | List. Query: `q`, `author_id`, `genre`, `status`, `page`, `limit`, `sort` |
| GET | `/stories/:id` | Admin, Editor | Detail with author + references |
| PATCH | `/stories/:id` | Admin, Editor | Update fields / references / content |
| PUT | `/stories/:id/pdf` | Admin, Editor | Replace PDF (`multipart`, field `pdf`) |
| DELETE | `/stories/:id` | Admin | Soft delete |

**Create story (text): request**
```json
{
  "author_id": 1,
  "title_kn": "ಕಥೆಯ ಶೀರ್ಷಿಕೆ",
  "title_en": "Story Title",
  "genre": "Short Story",
  "published_year": 1950,
  "summary": "…",
  "content_type": "text",
  "content_text": "ಕಥೆಯ ಪೂರ್ಣ ಪಠ್ಯ…",
  "status": "draft",
  "references": [
    { "name": "Review in Prajavani", "url": "https://example.com/review" },
    { "name": "Author interview",    "url": "https://example.com/interview" }
  ]
}
```

**Create story (PDF):** `multipart/form-data` with the same fields, `content_type=pdf`, a `pdf` file, and `references` as a JSON string.

**Story detail: response (shape)**
```json
{
  "success": true,
  "data": {
    "id": 12, "title_kn": "…", "content_type": "pdf", "pdf_url": "…", "status": "published",
    "author": { "id": 1, "name_kn": "…", "name_en": "…" },
    "references": [ { "id": 1, "name": "…", "url": "…", "sort_order": 0 } ]
  }
}
```
List endpoints return summary fields only (no `content_text`).

---

## 8. File Upload Rules

| Item | PDF (story) | Image (author photo) |
|---|---|---|
| Allowed types | `application/pdf` | `image/jpeg`, `image/png`, `image/webp` |
| Max size | 20 MB | 2 MB |
| Validation | Check MIME **and** magic bytes | Same |
| Stored filename | `<uuid>.pdf` (never the original name) | `<uuid>.<ext>` |
| Path / key | `stories/<story_id>/<uuid>.pdf` | `authors/<author_id>/<uuid>.<ext>` |
| Local dev URL | `http://localhost:5000/uploads/...` (served statically) | Same |

On replace or delete, the old file is removed from storage.

---

## 9. Suggested Project Structure

```
kannada-katha-kosha-api/
├── src/
│   ├── config/          # env, db, storage
│   ├── middleware/      # auth, role, validate, error, rateLimit, upload
│   ├── modules/
│   │   ├── auth/        # routes, controller, service, schema
│   │   ├── users/
│   │   ├── authors/
│   │   └── stories/
│   ├── storage/         # index.js, local.driver.js, r2.driver.js
│   ├── utils/           # response helpers, logger, pagination
│   ├── app.js
│   └── server.js
├── migrations/
├── seeds/               # create-admin.js, sample-data.js
├── uploads/             # local dev only (git-ignored)
├── postman/             # collection + environment
├── .env.example
├── .gitignore
└── README.md
```

---

## 10. Local Development Setup (for the developer)

**Prerequisites:** Node.js 20+, MySQL 8 (local install or Docker), Git, Postman.

**`.env.example`**
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=katha_kosha

JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES_DAYS=7

CORS_ORIGINS=http://localhost:3000,http://localhost:5173

STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
PUBLIC_BASE_URL=http://localhost:5000

# Production only (R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@12345
```

**Commands the project must support**
```bash
npm install
npm run migrate        # create all tables
npm run seed:admin     # creates first admin from SEED_ADMIN_* vars
npm run seed:sample    # optional: 3 authors, 5 stories, references
npm run dev            # nodemon
npm start              # production
```

**Optional Docker (MySQL only)**
```bash
docker run --name kk-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=katha_kosha \
  -p 3306:3306 -d mysql:8 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

---

## 11. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | `helmet`, CORS whitelist from env, parameterized queries only, no secrets in code, passwords never logged or returned |
| Validation | Every endpoint validates body, params, and query |
| Pagination | Default `limit=20`, max `100` |
| Search | `q` matches `title_kn`, `title_en`, `name_kn`, `name_en` using `LIKE` (v1) |
| Errors | Central error handler, no stack traces in production |
| Performance | List endpoints under 300 ms for ~10k stories |
| Health | `GET /health` returns `{status:"ok"}` and checks the DB |
| Git | `.env` and `uploads/` git-ignored; conventional commit messages |

---

## 12. Deliverables from the Developer

1. Working API matching Section 7, running locally.
2. Migrations + seed scripts (Section 10).
3. **Postman collection + environment** covering every endpoint (success and error cases).
4. `README.md` with setup steps and the storage-driver explanation.
5. Both storage drivers implemented (`local` tested; `r2` implemented, tested at deployment).
6. Source pushed to the agreed Git repository.

---

## 13. Acceptance Checklist

- [ ] Admin logs in with the seeded account; Editor created by Admin can log in.
- [ ] Editor cannot access `/users` or any `DELETE` endpoint (403).
- [ ] Refresh-token rotation works; a reused old refresh token is rejected.
- [ ] Author created with Kannada name and stored/returned without corruption.
- [ ] Story cannot be created with a missing or deleted `author_id`.
- [ ] Story with pasted text and story with PDF both work; the rules in Section 5 are enforced.
- [ ] Adding, removing, and reordering references (name + URL) works through one update call.
- [ ] Author with active stories cannot be deleted (409).
- [ ] Soft-deleted records do not appear in any list or detail response.
- [ ] Oversized or non-PDF uploads are rejected (413/415).
- [ ] All endpoints are in the Postman collection and pass.

---

## 14. Deployment Notes (owner's reference)

| Item | Plan |
|---|---|
| Server | Any Linux VPS: Node 20, PM2, Nginx reverse proxy + HTTPS (Let's Encrypt) |
| DB | MySQL 8 with daily backup (`mysqldump` cron) |
| Files | Switch `STORAGE_DRIVER=r2`, add R2 credentials |
| Secrets | Fresh JWT secrets and a strong admin password; change the seeded admin password on first login |
| CORS | Set `CORS_ORIGINS` to the real frontend domain |

---

## 15. Assumptions & Future Extensions

- Genre is free text in v1; a `genres` table can come later.
- Editors cannot delete (confirm with the owner if this should change).
- Future: multiple authors per story (`story_authors` join table), public read API, full-text search, audio, categories/tags.
