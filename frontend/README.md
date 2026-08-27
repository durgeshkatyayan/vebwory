# Task Webvory Frontend

The frontend is a React 19 single-page application built with Vite. It provides the browser interface for authentication, dashboard metrics, task management, task comments, theme switching, and a JSONPlaceholder photo directory.

## Architecture

`src/main.jsx` mounts the application inside `AuthProvider`. `src/App.jsx` owns the browser route tree and authenticated shell. Pages use React hooks for local state and call the Axios service in `src/components/services/api.js`.

There is no Redux, Zustand, or other state-management library. Authentication and session state are shared through React Context; page and form state is local component state.

## Technologies and dependencies

Runtime dependencies from `package.json`:

- React and React DOM 19
- React Router DOM 7
- Axios
- Tailwind CSS 4 and `@tailwindcss/vite`
- Lucide React
- SweetAlert2
- `clsx`

Development dependencies include Vite, the React Vite plugin, ESLint, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, PostCSS, and Autoprefixer.

## Folder structure

```text
frontend/
├── package.json
├── package-lock.json
├── index.html
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
├── public/
└── src/
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── main.jsx
    ├── assets/
    ├── context/
    │   └── AuthContext.jsx
    └── components/
        ├── ProtectedRoute.jsx
        ├── TaskCard.jsx
        ├── pages/
        │   ├── Auth.jsx
        │   ├── Dashboard.jsx
        │   ├── ExternalUsers.jsx
        │   ├── TaskDetail.jsx
        │   └── TaskList.jsx
        ├── services/
        │   └── api.js
        └── ui/
            ├── Button.jsx
            ├── Input.jsx
            ├── Modal.jsx
            ├── Pagination.jsx
            ├── PriorityBadge.jsx
            ├── Select.jsx
            ├── StatusBadge.jsx
            └── Table.jsx
```

`TaskCard.jsx`, `Table.jsx`, and `App.css` are currently empty. `Pagination.jsx` exists but is not used by the active task-list page and imports `Button` as a default export even though `Button.jsx` exports it by name.

## Routes and pages

- `/auth` — login and registration form
- `/` — dashboard metrics with refresh action
- `/tasks` — task table, search, filters, pagination, creation modal, and admin delete action
- `/tasks/:id` — task editing, metadata, comments, and admin delete action
- `/external` — photo directory loaded from JSONPlaceholder with `IntersectionObserver` infinite scrolling

`App.jsx` redirects authenticated users away from `/auth`, redirects unauthenticated users to `/auth`, and sends unknown authenticated paths to `/`. `ProtectedRoute.jsx` provides an outlet-based alternative but is not used by `App.jsx`.

## Authentication

`AuthContext.jsx` exposes `user`, `token`, `loading`, `login`, `register`, `logout`, and `isAuthenticated`.

- Successful login or registration stores `token` and serialized `user` in `localStorage`.
- Initial loading restores both values from local storage without calling `/api/auth/me`.
- Logout removes both values and redirects to `/auth`.
- The Axios request interceptor adds the bearer token to API requests.
- A `401` response clears stored auth data and redirects to `/auth`.
- The signup payload sends role `member`; the backend also forces public signup to `member`.

The task UI hides delete controls unless the stored user role is `admin`, while backend authorization remains authoritative.

## Forms and validation

Forms use controlled React state and native browser validation. There is no frontend validation library.

- Authentication email fields use `type="email"` and are required.
- Authentication passwords are required and use `minLength={6}`.
- Signup name is required.
- Task title is required.
- Backend Pydantic validation remains the final validation layer for names, emails, passwords, titles, enums, and comments.

Task creation and editing convert selected date values to ISO strings and convert assignee IDs to integers or null. Task comments require non-empty text and a selected author ID.

## Environment variables

Create `frontend/.env` for local overrides:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
```

`VITE_API_BASE_URL` is read by `src/components/services/api.js`. If it is absent, the same local API URL is used. Vite exposes only variables prefixed with `VITE_` to browser code; do not put secrets in this file.

The photo directory uses the fixed URL `https://jsonplaceholder.typicode.com/photos` and does not use an environment variable.

## Installation

From this directory, install the locked Node dependency set:

```text
npm install
```

## Development

Start the Vite development server:

```text
npm run dev
```

The terminal prints the development URL. The backend should be running at the URL configured by `VITE_API_BASE_URL`.

## Production build

Create the production bundle:

```text
npm run build
```

Vite writes the bundle to `frontend/dist`. Preview the built bundle locally with:

```text
npm run preview
```

Because this is a browser SPA, a production static host should route application paths back to `index.html`.

## API integration

The Axios client uses `VITE_API_BASE_URL` and JSON content headers. It exposes functions for:

- Login and signup
- Dashboard metrics
- Task listing, detail, creation, update, deletion, and comments
- User listing
- Backend external users
- Direct JSONPlaceholder photos

The current `/external` page calls the direct photo function. The `getExternalUsers` function exists but is not used by the current route.

Backend API paths are relative to the configured base URL, for example `/auth/login`, `/tasks`, and `/dashboard`.

## UI structure

Shared UI components include buttons, inputs, selects, modal behavior, status badges, priority badges, and a pagination component. Tailwind styles are configured through `vite.config.js`; global theme and scrollbar styles are in `src/index.css`.

The theme toggle adds or removes the `dark` class on the document root and stores the selection under `localStorage.theme`. SweetAlert2 handles success, confirmation, and error dialogs for task operations and external-photo failures.

## Important commands

```text
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

No frontend test script or automated test suite is defined in `package.json`.
