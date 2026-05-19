# ReadLog

![CI](https://github.com/Med-Marz/ReadLog/actions/workflows/ci.yml/badge.svg)

A personal book tracker. Search the OpenLibrary catalog, organise your
reading across three lists (**To Read** / **Reading** / **Read**), rate and
review the books you finish, and track progress toward a yearly reading goal.

## Stack

- **Backend**: FastAPI (Python 3.11) + SQLAlchemy + SQLite
- **Frontend**: React + Vite + Tailwind CSS
- **External API**: [OpenLibrary](https://openlibrary.org/developers/api)
- **Infrastructure**: Docker + Docker Compose
- **Automation**: Bash deploy script + Ansible playbook
- **Tests**: pytest

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React      │────▶│   FastAPI    │────▶│   OpenLibrary   │
│  (nginx)     │     │              │     │                 │
└──────────────┘     └──────┬───────┘     └─────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   SQLite     │
                     └──────────────┘
```

## Quick start

Requires Docker and Docker Compose.

```bash
./deploy.sh
```

Then open <http://localhost:8090>.

## Local development

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (in another shell)
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend && pytest
```

## Deployment via Ansible

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

## Security

- **Input validation** — every write endpoint uses Pydantic schemas with typed
  fields, bounded ratings (1-5), bounded yearly goal (1-1000), and an enum-constrained
  `status` (`to_read` / `reading` / `read`). Invalid payloads are rejected with `422`.
- **CORS** — `CORSMiddleware` is configured with explicit allowed origins (no wildcard).
  Origins are read from the `CORS_ORIGINS` environment variable.
- **Secrets** — configuration is loaded from `.env` via `pydantic-settings`. `.env`
  files are gitignored. OpenLibrary requires no API key, so no secret is hardcoded
  anywhere in the codebase.
- **SQL injection** — all database access goes through the SQLAlchemy ORM with
  parameterized queries. No raw SQL string concatenation.
- **Container hardening** — the backend container runs as a non-root `appuser`
  with `nologin` shell. Both images use slim/alpine bases to reduce attack surface.
- **Third-party isolation** — the browser never talks to OpenLibrary directly;
  the backend proxies all external calls, keeping CORS tight and making the
  outbound traffic auditable from one place.

## Project layout

```
backend/    FastAPI application, SQLAlchemy models, pytest suite
frontend/   React + Vite app served by nginx in production
ansible/    Playbook + inventory for one-shot deployment
deploy.sh   Bash wrapper around docker compose
```
