# TaskManager Pro

A reusable task-management dashboard with a React/Vite frontend and a FastAPI backend. It includes server-side filtering and pagination, task CRUD, assignment, comments, dashboard statistics, and a JSONPlaceholder external-user integration.

## Tech stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios
- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite by default; PostgreSQL can be configured later through `DATABASE_URL`

## Run locally

### Backend

From `backend/`, install dependencies and start the API:

```text
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The API is available at `http://localhost:8000`; interactive documentation is at `http://localhost:8000/docs`.

### Frontend

From `frontend/`, install dependencies and start Vite:

```text
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Configuration

The backend uses `sqlite:///./tasks.db` by default. The frontend expects the API at `http://localhost:8000/api`. Authentication is intentionally omitted for this assignment; comments currently use seeded user ID `1`.

## API overview

- `GET /api/tasks?status=In%20Progress&priority=High&assignee=1&search=report&page=1&limit=10`
- `POST /api/tasks`, `GET /api/tasks/{id}`, `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}`
- `POST /api/tasks/{id}/comments`
- `GET /api/users`, `POST /api/users`
- `GET /api/dashboard`
- `GET /api/external/users`

The database is created automatically on startup and two sample users are seeded when it is empty.
