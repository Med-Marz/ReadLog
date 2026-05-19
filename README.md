# ReadLog

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

Then open <http://localhost:8080>.

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

## Project layout

```
backend/    FastAPI application, SQLAlchemy models, pytest suite
frontend/   React + Vite app served by nginx in production
ansible/    Playbook + inventory for one-shot deployment
deploy.sh   Bash wrapper around docker compose
```
