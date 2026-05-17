# CITS5505 Project — Fork & Flame

A restaurant review web application built with Flask, SQLite, Jinja2 templates, and vanilla JavaScript.

**Repository:** https://github.com/Vaishnavipawarr/CITS5505_Project

---

## Team Members

| UWA ID   | Name                    | GitHub            |
|----------|-------------------------|-------------------|
| 24601375 | Riya Sakhiya            | RiyaSakhiya       |
| 24250049 | Li Luo                  | Lawlee-L          |
| 25014553 | Vaishnavi Satish Pawar  | Vaishnavipawarr   |
| 24726476 | Thanh Nguyen            | thanhng0209       |

---

## Project Overview

Fork & Flame lets users browse restaurants, read and write reviews, and manage accounts as either a **customer** or a **restaurant owner**.

- Pages are rendered with **Jinja2** (`templates/`) and served by Flask routes.
- Static assets (CSS/JS) live under `frontend/` and are served at `/css/...` and `/js/...`.
- Data is stored in **SQLite** (`instance/database.db`).
- Authentication uses **Flask sessions** with password hashing (Werkzeug).
- Mutating API requests are protected with **CSRF tokens**.

Always run the app through Flask (`http://127.0.0.1:5000/`). Do not open HTML files directly in the browser.

---

## Features

- User registration and login (customer / owner roles)
- Session-based authentication and protected dashboards
- Restaurant listing with search and filters
- Review browsing, creation, editing, and deletion
- Owner replies to reviews
- Owner dashboard: bio, price tier, avatar upload
- Customer dashboard: write and manage own reviews
- CSRF protection on state-changing API calls
- Responsive layout with mobile navigation
- Unit tests (`pytest`) and browser tests (Selenium)

---

## Technologies Used

- Python 3, Flask, Jinja2
- SQLite
- HTML5, CSS3, JavaScript
- Bootstrap 5
- pytest, Selenium, webdriver-manager
- python-dotenv

---

## Project Structure

```text
CITS5505_Project/
├── app/
│   ├── __init__.py          # Flask app factory, secret key, blueprint
│   └── routes.py            # Page routes and REST API
├── templates/               # Jinja2 HTML (extends base.html)
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── restaurants.html
│   ├── reviews.html
│   ├── customer-dashboard.html
│   └── owner-dashboard.html
├── frontend/
│   ├── css/                 # Page and shared styles
│   └── js/                  # Page scripts + app.js (session, CSRF, nav)
├── tests/                   # pytest unit tests
├── selenium_tests/          # End-to-end browser tests
├── instance/
│   └── database.db          # SQLite database (local)
├── mainApp.py               # Entry point
├── requirements.txt
├── .env.example             # Copy to .env for local config
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Vaishnavipawarr/CITS5505_Project.git
cd CITS5505_Project
```

### 2. Create and activate a virtual environment

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set a strong `SECRET_KEY` (used for Flask sessions):

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Run the application

```bash
python mainApp.py
```

Open in your browser:

```text
http://127.0.0.1:5000/
```

---

## Frontend Routes

| Route                  | Page                 |
|------------------------|----------------------|
| `/`                    | Home                 |
| `/login`               | Login                |
| `/signup`              | Sign up              |
| `/restaurants`         | Restaurant listings  |
| `/reviews`             | Reviews              |
| `/customer-dashboard`  | Customer dashboard   |
| `/owner-dashboard`     | Owner dashboard      |
| `/logout`              | Log out              |

Query parameters (examples):

- `/restaurants?q=italian` — search restaurants
- `/reviews?restaurant=r1` — filter reviews by restaurant

---

## API Endpoints

| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| GET    | `/api/health`                         | Health check                   |
| GET    | `/api/csrf-token`                     | CSRF token for mutating calls  |
| POST   | `/api/auth/register`                  | Register user                  |
| POST   | `/api/auth/login`                     | Log in                         |
| GET    | `/api/auth/status`                    | Current session status         |
| GET    | `/logout`                             | Log out                        |
| GET    | `/api/restaurants`                    | List restaurants               |
| GET    | `/api/reviews`                        | List reviews (optional filters)|
| POST   | `/api/reviews`                        | Create review                  |
| PUT    | `/api/reviews/<id>`                   | Update review                  |
| DELETE | `/api/reviews/<id>`                   | Delete review                  |
| PUT    | `/api/reviews/<id>/reply`             | Owner reply to review          |
| POST   | `/api/auth/upload-avatar`             | Upload profile avatar          |
| PUT    | `/api/restaurants/<id>/bio`           | Update restaurant bio          |
| PUT    | `/api/restaurants/<id>/price`         | Update price tier              |

### Example: register

```json
POST /api/auth/register
{
  "name": "Test User",
  "username": "newuser",
  "password": "1234",
  "role": "customer"
}
```

### Example: login

```json
POST /api/auth/login
{
  "username": "newuser",
  "password": "1234",
  "role": "customer"
}
```

Successful responses use `{ "success": true, ... }`. Errors return `{ "success": false, "message": "..." }` with an appropriate HTTP status code.

---

## Authentication

1. User registers via `POST /api/auth/register` (role: `customer` or `owner`).
2. User logs in via `POST /api/auth/login`; Flask stores the session.
3. Protected pages (`/customer-dashboard`, `/owner-dashboard`) redirect unauthenticated users to `/login`.
4. Check session with `GET /api/auth/status`.
5. Log out with `GET /logout`.

Passwords are hashed before storage; plain-text passwords are never saved.

---

## CSRF Protection

State-changing requests (`POST`, `PUT`, `DELETE`) to most API routes require a valid CSRF token.

1. Fetch a token: `GET /api/csrf-token`
2. Send it on mutating requests as header: `X-CSRFToken: <token>`

The frontend loads the token in `frontend/js/app.js` and attaches it automatically via a `fetch` interceptor. Auth register/login endpoints are exempt so sign-up still works.

---

## Running Tests

### Unit tests (no browser required)

```bash
pytest tests/
```

Covers health check, registration, login, logout, and protected route access.

### Selenium tests

Selenium is included in `requirements.txt`. Start the Flask server in one terminal:

```bash
python mainApp.py
```

Run tests in another terminal:

```bash
pytest selenium_tests/
```

Or a single file:

```bash
pytest selenium_tests/test_login_flow.py
```

Selenium uses Chrome via `webdriver-manager`. Keep the server running while tests execute.

---

## Manual API Testing

You can test endpoints from the browser console (while logged in on the site), Postman, or Thunder Client.

Register (from console on the signup page):

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    username: 'newuser',
    password: '1234',
    role: 'customer'
  })
}).then(r => r.json()).then(console.log);
```

Check auth status:

```javascript
fetch('/api/auth/status').then(r => r.json()).then(console.log);
```

---

## Troubleshooting

**Flask will not start** — Activate the virtual environment, then run `python mainApp.py`.

**ModuleNotFoundError** — Run `pip install -r requirements.txt`.

**Port 5000 in use** — Stop the other process (`Ctrl+C`) and restart the server.

**CSS or JS not loading** — Use `http://127.0.0.1:5000/`, not `file://` paths to HTML.

**Database errors** — Ensure `instance/database.db` exists (created on first run if the app initializes the DB).

**Login loops back to login** — Restart Flask after code changes; confirm `SECRET_KEY` is set in `.env`; check `/api/auth/status`.

**CSRF 403 on API calls** — Ensure `GET /api/csrf-token` succeeds and mutating requests include `X-CSRFToken`.

**Git merge conflicts** — Before new work: `git checkout main && git pull`, then branch: `git checkout -b your-branch-name`.

---

## Future Improvements

- Separate test database from development data
- Auto-start Flask in Selenium test fixtures
- Password reset flow
- Admin dashboard
- Expanded automated test coverage

---

## Notes

- SQLite is for local development only.
- Do not commit `.env` or secrets; use `.env.example` as a template.
- `instance/database.db` may contain local test data; coordinate with the team before resetting it.
