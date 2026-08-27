# Task Webvory

Task Webvory is a full-stack task-management application. The React frontend provides authentication, a dashboard, task search and pagination, task editing, comments, theme switching, and an external photo directory. The FastAPI backend exposes the authenticated task-management API, persists data with SQLAlchemy, seeds initial records, and proxies an external JSONPlaceholder user directory.

> This documentation describes the implementation currently present in the repository. It does not claim functionality that is not implemented.

## Features

- Login and account registration
- Custom bearer-token authentication with 24-hour token expiry
- Roles: `admin`, `manager`, and `member`
- Dashboard metrics for task status and overdue work
- Task creation, listing, filtering, pagination, updating, and deletion
- Task assignment to users
- Task comments with author and timestamp information
- Admin-only user creation and task deletion
- JSONPlaceholder external-user API endpoint in the backend
- JSONPlaceholder photo directory with frontend infinite scrolling
- Light/dark theme toggle stored in browser local storage
- FastAPI interactive documentation

## Architecture

```text
Browser
  └─ React 19 + Vite frontend
       ├─ React Router pages
       ├─ AuthContext and localStorage session state
       └─ Axios API client
            ├─ FastAPI application (/api/*)
            ├─ SQLAlchemy database
            └─ JSONPlaceholder external services
```

The frontend and backend are separate applications. The frontend calls the backend through `VITE_API_BASE_URL`, while the photo directory calls JSONPlaceholder directly. The backend’s `/api/external/users` endpoint is separate and is not used by the current photo-directory page.

## Frontend technologies

- React 19
- React DOM 19
- Vite 8
- React Router DOM 7
- Axios
- Tailwind CSS 4 through `@tailwindcss/vite`
- Lucide React icons
- SweetAlert2
- ESLint with React Hooks and React Refresh plugins

## Backend technologies

- Python
- FastAPI
- Uvicorn
- SQLAlchemy 2
- Pydantic 2
- `email-validator`
- HTTPX
- `python-dotenv` is optionally loaded by `database.py` when installed

The active authentication implementation is in `backend/auth.py`. It uses PBKDF2-HMAC-SHA256 password hashes and a custom HMAC-SHA256 signed bearer-token format. `backend/security.py` contains a separate JWT/passlib implementation and is imported by startup seeding, but the active request dependencies use `backend/auth.py`.

## Database

`backend/database.py` reads `DATABASE_URL`. When it is not set, the code falls back to a PostgreSQL URL defined in source. SQLAlchemy is configured with a pool size of 10, up to 20 overflow connections, pre-ping, and a 3600-second recycle interval.

At import time, `backend/main.py` runs `Base.metadata.create_all(bind=engine)`. There is no Alembic setup, migrations directory, migration script, or other migration framework.

### Tables

- `users`: name, unique email, password hash, role, and creation timestamp
- `tasks`: title, description, priority, status, due date, timestamps, and optional assignee
- `comments`: content, timestamp, task reference, and author reference

Task deletion cascades to comments. User deletion cascades to comments, while deleting an assigned user sets `tasks.assignee_id` to null.

When the user table is empty, startup seeds three users and one task. The seed records are defined in `backend/main.py`; their credentials should be changed or removed before a production deployment.

## Project structure

```text
.
├── README.md
├── backend/
│   ├── auth.py                 Active password and bearer-token authentication
│   ├── database.py             SQLAlchemy engine, session, and base
│   ├── dependencies.py         Separate unused role-checking implementation
│   ├── main.py                 FastAPI app, startup seed, health endpoint
│   ├── models.py               SQLAlchemy models and enums
│   ├── repositories.py         Task persistence and dashboard queries
│   ├── requirements.txt        Python dependency declarations
│   ├── schemas.py              Pydantic request and response schemas
│   ├── security.py             Separate JWT/passlib helper implementation
│   ├── services.py             JSONPlaceholder user service
│   └── routes/
│       ├── auth.py
│       ├── dashboard.py
│       ├── external.py
│       ├── tasks.py
│       └── users.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── eslint.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── context/AuthContext.jsx
        ├── components/ProtectedRoute.jsx
        ├── components/pages/
        ├── components/services/api.js
        └── components/ui/
```

## Environment variables

Environment files exist at `backend/.env` and `frontend/.env`. Their values are intentionally not documented.

### Backend

```dotenv
DATABASE_URL=<sqlalchemy-database-url>
AUTH_SECRET=<long-random-signing-secret>
```

`DATABASE_URL` is optional in code but should be set explicitly. `AUTH_SECRET` is required for active token creation. `JWT_SECRET_KEY` is referenced only by the separate implementation in `security.py`; it is not used by the active route authentication flow.

### Frontend

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
```

If omitted, the frontend uses `http://localhost:8000/api`.

## Setup

### 1. Backend environment

Create and activate a Python virtual environment, then install the declared backend dependencies from `backend/requirements.txt`.

The current `requirements.txt` does not declare `passlib`, `bcrypt`, or `python-jose`, although `backend/security.py` imports those packages during application startup. Install the packages required by that module, or add them to the project dependency file, before starting the backend if they are not already available in the environment.

The startup seed uses the password helper from `security.py`, while login verification uses the PBKDF2 helper from `auth.py`. These formats are different, so the source-defined seeded passwords are not compatible with the active login verifier as written; this should be reconciled before relying on seeded accounts.

Set `AUTH_SECRET` and, preferably, `DATABASE_URL` in `backend/.env`.

### 2. Frontend environment

From `frontend/`, install the Node dependencies. Optionally set `VITE_API_BASE_URL` in `frontend/.env` when the API is not at the default local URL.

## Run the backend

Run from the `backend/` directory:

```text
python -m uvicorn main:app --reload
```

The development API is normally available at `http://localhost:8000`.

## Run the frontend

Run from the `frontend/` directory:

```text
npm run dev
```

Vite prints the local development URL in the terminal.

## Frontend routes

- `/auth` — login and signup
- `/` — authenticated dashboard
- `/tasks` — authenticated task list
- `/tasks/:id` — authenticated task detail and comments
- `/external` — authenticated JSONPlaceholder photo directory

Unknown authenticated paths redirect to `/`. Unauthenticated users redirect to `/auth`. `ProtectedRoute.jsx` exists but is not used by the current `App.jsx` route tree.

## API documentation

With the backend running, FastAPI provides:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI schema: `http://localhost:8000/openapi.json`

### Authentication endpoints

| Method | Endpoint | Auth | Behavior |
|---|---|---:|---|
| `POST` | `/api/auth/signup` | No | Creates a member account and returns token plus user |
| `POST` | `/api/auth/login` | No | Validates credentials and returns token plus user |
| `GET` | `/api/auth/me` | Yes | Returns the authenticated user |

### User endpoints

| Method | Endpoint | Auth | Behavior |
|---|---|---:|---|
| `GET` | `/api/users` | Yes | Returns users ordered by name |
| `POST` | `/api/users` | Admin | Creates a user and hashes its password |

### Task endpoints

| Method | Endpoint | Auth | Behavior |
|---|---|---:|---|
| `GET` | `/api/tasks` | Yes | Paginated tasks with `page`, `page_size`, `search`, `status`, `priority`, and `assignee_id` filters |
| `POST` | `/api/tasks` | Any role | Creates a task |
| `GET` | `/api/tasks/{task_id}` | Yes | Returns a task, assignee, comments, and comment authors |
| `PUT` | `/api/tasks/{task_id}` | Any role | Partially updates a task |
| `DELETE` | `/api/tasks/{task_id}` | Admin | Deletes a task and cascaded comments |
| `POST` | `/api/tasks/{task_id}/comments` | Yes | Adds a comment; `author_id` is supplied by the client |

Task list `page_size` must be between 1 and 100. Tasks are searched in title and description and ordered newest first.

### Other endpoints

| Method | Endpoint | Auth | Behavior |
|---|---|---:|---|
| `GET` | `/api/dashboard` | Yes | Returns task totals by status plus overdue count |
| `GET` | `/api/external/users` | Yes | Fetches JSONPlaceholder users through the backend |
| `GET` | `/api/health` | No | Returns healthy status and a UTC timestamp |

## Authentication flow

1. The user submits login or signup in `frontend/src/components/pages/Auth.jsx`.
2. The backend validates the request with Pydantic and returns a custom bearer token and user object.
3. `AuthContext` stores both values in `localStorage` under `token` and `user`.
4. The Axios request interceptor adds `Authorization: Bearer <token>` to backend requests.
5. The backend validates the signature, expiry, and user ID on protected routes.
6. A `401` response clears local storage and redirects the browser to `/auth`.
7. Logout clears local storage and redirects to `/auth`.

Signup always creates a `member`, regardless of any submitted role. The backend’s role checks are authoritative; the frontend only hides admin-only controls for non-admin users.

## Important commands

Backend:

```text
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Frontend:

```text
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Build and deployment

Create the frontend production bundle with `npm run build`. The output is written to `frontend/dist`; serve that directory with a static web server or hosting provider that supports single-page application fallback to `index.html`.

Run the backend with Uvicorn using an externally managed process in production. Set a production `DATABASE_URL` and a strong `AUTH_SECRET`, configure the frontend `VITE_API_BASE_URL` at build time, and replace the permissive development CORS configuration in `backend/main.py` with an explicit list of trusted origins.

The repository currently contains no Dockerfile, deployment manifest, CI workflow, process manager configuration, or migration workflow.

## Troubleshooting

- **Backend import fails for `passlib` or `jose`:** these packages are imported by `security.py` but are absent from the declared requirements; install/add the missing dependencies.
- **PostgreSQL connection fails with a missing driver:** the fallback URL is PostgreSQL, but no PostgreSQL driver is declared in `requirements.txt`; install the driver for the database URL you choose.
- **Seeded users cannot log in:** startup hashing uses `security.py`, while login verification uses the different format implemented in `auth.py`.
- **Token creation fails:** set `AUTH_SECRET` in the backend environment.
- **Database connection fails:** set `DATABASE_URL` to a reachable SQLAlchemy URL. The application calls `create_all` at startup.
- **Frontend cannot reach the API:** check `VITE_API_BASE_URL`, backend availability, and the backend CORS policy.
- **Existing seed data does not appear:** startup seeds only when `users` is empty.
- **External data does not load:** the backend user endpoint and frontend photo page both depend on JSONPlaceholder availability.
- **Schema changes are not applied:** there are no migrations; `create_all` does not alter existing tables.

## Tests and background jobs

No automated test suite or background job worker is present in the repository.

## Author

The repository does not specify an author name or organization. Add project ownership details here when they are available.
