# Task Webvory Backend

The backend is a FastAPI application for authentication, users, tasks, comments, dashboard metrics, and an external JSONPlaceholder user directory. It uses SQLAlchemy for persistence and Pydantic models for request and response validation.

## Architecture

- `main.py` creates the FastAPI application, creates database tables, configures CORS, registers routers, seeds initial data, and exposes the health endpoint.
- `database.py` loads database configuration, creates the SQLAlchemy engine/session factory, and provides the request session dependency.
- `models.py` defines the SQLAlchemy tables and enum values.
- `schemas.py` defines Pydantic request and response models.
- `repositories.py` contains task persistence, comments, pagination, and dashboard queries.
- `auth.py` contains the active password hashing, bearer-token parsing, token creation, and role dependency functions.
- `security.py` contains a separate JWT/passlib implementation imported by startup seeding; active protected routes use `auth.py`.
- `services.py` calls JSONPlaceholder for external users.
- `routes/` contains FastAPI routers.

## Technologies and dependencies

Declared in `requirements.txt`:

- FastAPI `>=0.115,<1.0`
- Uvicorn with standard extras `>=0.30,<1.0`
- SQLAlchemy `>=2.0,<3.0`
- Pydantic `>=2.7,<3.0`
- `email-validator` `>=2.1,<3.0`
- HTTPX `>=0.27,<1.0`

`database.py` optionally imports `python-dotenv`. `security.py` imports `python-jose` and `passlib` and configures bcrypt. Those packages are not currently listed in `requirements.txt`, but the module is imported by `main.py`; ensure the environment contains the packages required by the current source before starting the application.

The fallback database URL is PostgreSQL, but `requirements.txt` does not declare a PostgreSQL driver. The driver must be available when using that fallback or another PostgreSQL `DATABASE_URL`.

## Folder structure

```text
backend/
├── main.py
├── auth.py
├── database.py
├── dependencies.py
├── models.py
├── repositories.py
├── requirements.txt
├── schemas.py
├── security.py
├── services.py
└── routes/
    ├── auth.py
    ├── dashboard.py
    ├── external.py
    ├── tasks.py
    └── users.py
```

`dependencies.py` defines a separate `RoleChecker` that imports `get_current_user` from `dependencies`, but the active route modules use dependencies from `auth.py` instead.

## Environment variables

The repository contains `backend/.env`; its values are not documented here.

```dotenv
DATABASE_URL=<sqlalchemy-database-url>
AUTH_SECRET=<long-random-token-signing-secret>
JWT_SECRET_KEY=<jwt-signing-secret-if-the-separate-security-module-is-used>
```

- `DATABASE_URL` is read by `database.py`. If unset, source code uses a PostgreSQL fallback URL.
- `AUTH_SECRET` is used by the active custom-token implementation in `auth.py` and should be set before login or signup.
- `JWT_SECRET_KEY` is referenced by the separate JWT implementation in `security.py`, not by the active route dependencies.

Do not place frontend secrets in environment variables exposed to browser code. Never commit actual secret values.

## Database setup

The application creates the SQLAlchemy engine when `database.py` is imported and calls `Base.metadata.create_all(bind=engine)` in `main.py`. Set `DATABASE_URL` to a reachable SQLAlchemy database URL before startup.

The code defines these tables:

### `users`

`id`, `name`, unique indexed `email`, `password_hash`, enum `role`, and `created_at`.

### `tasks`

`id`, `title`, `description`, enum `priority`, enum `status`, `due_date`, `created_at`, `updated_at`, and nullable `assignee_id` referencing `users.id`.

### `comments`

`id`, `content`, `created_at`, `task_id` referencing `tasks.id`, and `author_id` referencing `users.id`.

Task comments are returned newest first. Task deletion cascades to comments. User deletion cascades to comments, and deleting an assignee sets the task assignee to null.

When there are no users, the startup handler creates three source-defined users and one urgent in-progress task. The seed password is defined in `main.py`; change or remove the seed behavior before production use.

Startup calls `security.hash_password`, which creates passlib/bcrypt hashes. Login calls `auth.verify_password`, which expects the PBKDF2 format from `auth.py`. Because these formats differ, the seeded password hashes are not compatible with the active login verifier as written.

## Migrations

No migration system is present. The repository has no Alembic configuration, migration directory, migration scripts, or `pyproject.toml`. `create_all` creates missing tables but does not provide schema-change migrations for existing databases.

## API routes

All paths below include the `/api` prefix.

### Health

| Method | Path | Authentication | Description |
|---|---|---:|---|
| `GET` | `/api/health` | No | Returns `status: healthy` and a UTC timestamp |

### Authentication (`routes/auth.py`)

| Method | Path | Authentication | Description |
|---|---|---:|---|
| `POST` | `/api/auth/signup` | No | Creates a public member account and returns token plus user |
| `POST` | `/api/auth/login` | No | Validates email/password and returns token plus user |
| `GET` | `/api/auth/me` | Bearer token | Returns the current user |

Public signup always stores role `member`. Duplicate email returns `400`; invalid login returns `401`.

### Users (`routes/users.py`)

| Method | Path | Authentication | Description |
|---|---|---:|---|
| `GET` | `/api/users` | Any authenticated user | Returns users ordered by name |
| `POST` | `/api/users` | Admin | Creates a user and hashes the submitted password |

Duplicate email on user creation returns `400`.

### Tasks (`routes/tasks.py`)

| Method | Path | Authentication | Description |
|---|---|---:|---|
| `GET` | `/api/tasks` | Any authenticated user | Paginated and filtered task list |
| `POST` | `/api/tasks` | Admin, manager, or member | Creates a task |
| `GET` | `/api/tasks/{task_id}` | Any authenticated user | Returns task details, assignee, comments, and authors |
| `PUT` | `/api/tasks/{task_id}` | Admin, manager, or member | Updates supplied task fields |
| `DELETE` | `/api/tasks/{task_id}` | Admin | Deletes a task |
| `POST` | `/api/tasks/{task_id}/comments` | Any authenticated user | Adds a comment to an existing task |

`GET /api/tasks` accepts `page` (minimum 1), `page_size` (1–100), `search`, `status`, `priority`, and `assignee_id`. Search checks title and description, and results are ordered by descending creation time. Missing tasks return `404`.

Comment requests include `content` and a client-supplied `author_id`. The current implementation does not replace that author ID with the authenticated user ID.

### Dashboard (`routes/dashboard.py`)

| Method | Path | Authentication | Description |
|---|---|---:|---|
| `GET` | `/api/dashboard` | Any authenticated user | Returns total, pending, in-progress, completed, blocked, and overdue task counts |

Overdue means a due date before the current UTC time and a status other than completed.

### External integration (`routes/external.py`)

| Method | Path | Authentication | Description |
|---|---|---:|---|
| `GET` | `/api/external/users` | Any authenticated user | Fetches JSONPlaceholder users through `ExternalAPIService` |

`services.py` uses `httpx.AsyncClient` with a 10-second timeout. Timeout, upstream HTTP status, and other failures are mapped to `504`, `502`, and `500` responses respectively.

## Authentication and authorization

The active `auth.py` implementation:

- Hashes passwords with PBKDF2-HMAC-SHA256, a random 16-byte salt, and 120,000 iterations.
- Creates a two-part token containing a base64url JSON payload and HMAC-SHA256 signature.
- Stores user ID, role, and a 24-hour expiration in the payload.
- Validates the token signature, expiration, and user ID on protected requests.
- Uses `HTTPBearer(auto_error=False)` and returns `401` for missing, malformed, invalid, or expired tokens.
- Returns `403` when a role dependency rejects the authenticated user.

There is no refresh token, server-side logout, ownership restriction, or rate limiting. The current comment endpoint accepts a client-selected author ID. The frontend hides admin controls for non-admin users, but backend role dependencies enforce access.

## Middleware and error handling

`main.py` installs `CORSMiddleware` with all origins, methods, headers, and credentials enabled. There is no custom global exception handler, request logging middleware, CSRF protection, rate limiting, or structured error layer.

Routes use FastAPI `HTTPException` for expected errors. External-service failures are handled in `ExternalAPIService`. Startup seed failures roll back the session, print an error, and allow startup to continue.

## Installation

From this directory:

```text
python -m venv .venv
```

Activate the environment using the command appropriate to your shell, then install dependencies:

```text
pip install -r requirements.txt
```

Because the current source imports `passlib`, bcrypt support, and `python-jose` through `security.py` while `requirements.txt` omits them, install or declare those packages if they are not already available.

Set `AUTH_SECRET` and `DATABASE_URL` in `backend/.env` before starting the server.

## Running the server

Run from the `backend/` directory:

```text
python -m uvicorn main:app --reload
```

The default development address is normally `http://localhost:8000`.

## API documentation

FastAPI automatically exposes:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Production setup

For production:

1. Use a managed database and set an explicit `DATABASE_URL`.
2. Set a long, randomly generated `AUTH_SECRET` outside source control.
3. Resolve the undeclared runtime dependencies used by `security.py`.
4. Replace the wildcard CORS policy with trusted frontend origins.
5. Run Uvicorn under an appropriate process manager or hosting service.
6. Introduce a real migration workflow before changing existing schemas.
7. Review the source-defined seed users and password behavior.

The repository contains no Dockerfile, deployment manifest, CI workflow, process configuration, migration workflow, or background job worker.

## Troubleshooting

- **`ModuleNotFoundError` for `passlib`, `bcrypt`, or `jose`:** these imports are used by `security.py` but are absent from `requirements.txt`; install/add the required packages.
- **PostgreSQL driver error:** the source fallback is PostgreSQL, but no PostgreSQL driver is declared in `requirements.txt`; install the driver required by the selected database URL.
- **Authentication fails during token creation:** verify `AUTH_SECRET` is present and identical across restarts.
- **Seeded users cannot authenticate:** startup and login use different password-hash implementations (`security.py` versus `auth.py`).
- **Database startup failure:** verify `DATABASE_URL` and database driver availability.
- **No initial records:** seed data is inserted only when `users` is empty.
- **Schema changes are missing:** `create_all` does not migrate existing tables; no migration system is included.
- **External endpoint errors:** confirm JSONPlaceholder is reachable; timeout and upstream failures are intentionally converted to gateway/server errors.

## Tests and background jobs

No automated backend test suite and no background job system are present in the repository.
