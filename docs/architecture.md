# Architecture — ReadLog

Two views: the **deployment** (what runs where) and the **request flow** (what
happens when the user clicks).

## 1. Deployment view

```mermaid
flowchart LR
    subgraph Browser
        UI[React UI]
    end

    subgraph Host[Host machine]
        direction TB
        subgraph Network[Docker network: readlog_default]
            direction LR
            FE[readlog-frontend<br/>nginx :80]
            BE[readlog-backend<br/>uvicorn :8000<br/>user: appuser]
        end
        VOL[(backend_data<br/>named volume<br/>SQLite file)]
    end

    OL[OpenLibrary<br/>openlibrary.org]

    UI -- HTTP --> FE
    FE -- /api/* proxy --> BE
    BE -- SQLAlchemy --> VOL
    BE -- HTTPS --> OL

    classDef container fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px;
    classDef external fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef volume fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
    class FE,BE container;
    class OL external;
    class VOL volume;
```

**Key points**

- Two containers in one private Docker network.
- Only the **frontend** exposes a host port (`:8090 → :80`). The backend is
  unreachable from outside the network.
- The SQLite file lives in a **named volume** so it survives `docker compose
  down`.
- The backend runs as a **non-root** user (`appuser`).
- The browser never talks to OpenLibrary — the backend proxies every call.

## 2. Request flow — adding a book from search

```mermaid
sequenceDiagram
    autonumber
    participant U as User (browser)
    participant N as nginx (frontend)
    participant F as FastAPI (backend)
    participant O as OpenLibrary
    participant D as SQLite

    U->>N: GET /api/search?q=dune
    N->>F: GET /search?q=dune
    F->>O: GET /search.json?q=dune
    O-->>F: docs[]
    F-->>N: normalised results
    N-->>U: JSON list shown in UI

    U->>N: POST /api/books { title, author, cover_url, ol_key }
    N->>F: POST /books
    F->>F: Pydantic validation
    F->>D: INSERT INTO books
    D-->>F: id, added_at
    F-->>N: 201 Created (book)
    N-->>U: refreshed library
```

## 3. Boot order

```mermaid
flowchart LR
    A[docker compose up] --> B[backend container starts]
    B --> C{healthcheck<br/>/health returns 200?}
    C -- no, retry every 5s --> C
    C -- yes --> D[frontend container starts]
    D --> E[nginx serves UI<br/>and proxies /api/*]
```

The `depends_on: condition: service_healthy` rule means the frontend never
sees a backend that isn't ready.
