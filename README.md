# API Client Platform (Postman Clone)

A functional clone of the Postman API client. Organize requests into collections,
build and send real HTTP requests through a backend proxy/runner, inspect
responses, manage environments with `{{variable}}` substitution, run sandboxed
pre-request/test scripts, and browse request history.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript, Redux Toolkit, CodeMirror 6,
  react-resizable-panels. Plain CSS theming for Postman-like dark UI.
- **Backend:** Python FastAPI in an MVC layout, SQLAlchemy 2.x ORM, Alembic
  migrations, httpx async runner, `cryptography` (Fernet) for secret encryption.
- **Database:** SQLite.
- **Script sidecar:** A separate Node.js service using `isolated-vm` to execute
  user JavaScript (pre-request and test scripts) inside a real V8 isolate.

## Architecture Overview

```
Browser (Next.js)
   │  REST /api/*
   ▼
FastAPI backend  ── POST /run ──►  httpx (real outbound HTTP request)
   │                                   │
   │  resolves {{variables}},          │ runs pre-request / test scripts
   │  encrypts secrets, writes history │
   ▼                                   ▼
SQLite                          Node script sidecar (isolated-vm, 127.0.0.1)
```

The backend acts as a proxy/runner so requests are sent server-side (no browser
CORS limits). The script sidecar is local-only; FastAPI is its only caller. If
the sidecar is unreachable, normal requests still work — only scripted requests
report "script engine unavailable".

### Backend layout (MVC)

```
backend/app/
  config/        settings (env), database engine/session
  models/        SQLAlchemy ORM models
  schemas/       Pydantic request/response DTOs
  repositories/  DB access (selectinload, no N+1; secret encryption)
  services/      crypto, variable_resolver, runner, script_client
  controllers/   thin handlers
  routes/        APIRouter per resource, mounted under /api
  middlewares/   error handler → consistent JSON envelope
```

## Database Schema

- **collections** `(id, name, description, created_at, updated_at)`
- **folders** `(id, collection_id→collections CASCADE, name, created_at)`
- **requests** `(id, collection_id CASCADE, folder_id→folders nullable, name,
  method, url, query_params JSON, headers JSON, body_mode, body_raw,
  body_raw_type, body_form JSON, auth_type, auth_data JSON, scripts JSON,
  settings JSON, sort_order, created_at, updated_at)`
- **environments** `(id, name, is_active, created_at, updated_at)`
- **environment_variables** `(id, environment_id→environments CASCADE, key,
  value, is_secret, enabled)`
- **history** `(id, method, url, request_snapshot JSON, status_code,
  response_time_ms, response_size_bytes, response_snapshot JSON, created_at)`

Key/value lists are JSON columns (always read/written whole). Real hierarchies
use foreign keys with cascade delete and eager loading to avoid N+1 queries.
Secret fields (`environment_variables.value` when `is_secret`, and bearer
token / basic password in `requests.auth_data`) are encrypted at rest. History
is unlimited and stores snapshots so re-opening works after edits/deletes.

## API Overview (all under `/api`)

- Collections: `GET/POST /collections`, `GET/PATCH/DELETE /collections/{id}`
- Folders: `POST /collections/{id}/folders`, `PATCH/DELETE /folders/{id}`
- Requests: `POST /collections/{id}/requests`, `GET/PATCH/DELETE /requests/{id}`,
  `GET /requests/{id}/auth/reveal`
- Environments: `GET/POST /environments`, `GET/PATCH/DELETE /environments/{id}`,
  `POST /environments/{id}/activate`, `GET /variables/{id}/reveal`
- History: `GET /history`, `DELETE /history/{id}`, `DELETE /history`
- Runner: `POST /run`

Secrets are masked (`••••••`) in normal responses and returned in plaintext only
via the dedicated reveal endpoints.

## Setup

### Prerequisites

- Python 3.10
- Node.js 22

### 1. Script sidecar

```
cd script-sidecar
npm install
node server.js          # listens on 127.0.0.1:9111
```

### 2. Backend

```
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt   # macOS/Linux

cp .env.example .env
# set APP_SECRET_KEY (required — the app refuses to start without it):
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

.venv/Scripts/alembic upgrade head
.venv/Scripts/python -m seed
.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```
cd frontend
npm install
cp .env.local.example .env.local      # NEXT_PUBLIC_API_BASE=http://localhost:8000/api
npm run dev                           # http://localhost:3000
```

### Run tests

```
cd backend
.venv/Scripts/python -m pytest
```

### Docker

```
export APP_SECRET_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
docker-compose up --build
```

Note: `NEXT_PUBLIC_API_BASE` is baked into the frontend at build time. The
default points the browser at `http://localhost:8000/api`.

## Request Settings: wired vs. display-only

Wired to the runner (affect the real request):
- Enable SSL certificate verification
- Automatically follow redirects + Maximum number of redirects
- Encode URL automatically
- HTTP version (Auto / HTTP/2)

Display-only (shown for Postman parity, marked `(stub)` in the UI, not wired):
- Follow original HTTP method, Follow Authorization header, Remove referer on
  redirect, Enable strict HTTP parser, Disable cookie jar, Use server cipher
  suite, TLS/SSL protocol disabling, Cipher suite selection.

## Scripts (`pm.*` supported)

`pm.environment.get/set`, `pm.variables.get`, `pm.response.{json(), text(), code,
responseTime}`, `pm.test(name, fn)`, `pm.expect(actual).to.equal/eql/be.ok`,
`console.log`. Scripts run in an isolated V8 sandbox with a wall-clock timeout
and no access to the host (`require`, `process`, filesystem, network are absent).

## Mocked / Placeholder Sections

Marked `(stub)` or "Coming Soon": team workspaces/sharing, mock servers, API
docs generation, monitors/scheduled runs, real user authentication (a single
default user is assumed), workspace Docs/Updates/Apps tabs, sidebar Specs &
Flows, Share request link, and the display-only request settings above.

## Assumptions

- Single default user; no real authentication.
- SQLite is sufficient for the assignment scope.
- The script sidecar runs alongside the backend (local process or compose service).
```
