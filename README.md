# CITS5505 Project — Fork & Flame

## Team Members

| UWA ID | Name | GitHub |
|--------|------|---------|
| 24601375 | Riya Sakhiya | RiyaSakhiya |
| 24250049 | Li Luo | Lawlee-L |
| 25014553 | Vaishnavi Satish Pawar | Vaishnavipawarr |
| 24726476 | Thanh Nguyen | thanhng0209 |

---

# Project Overview

Fork & Flame is a restaurant review web application built using Flask, SQLite, HTML, CSS, and JavaScript.

The platform allows users to:

- Browse restaurants
- Read restaurant reviews
- Register and log in securely
- Access customer and owner dashboards
- Manage authentication sessions

The frontend is served through Flask routes instead of opening HTML files directly in the browser.

---

# Features

- User registration and login
- Password hashing using Werkzeug
- Flask session management
- Logout functionality
- Authentication status API
- Protected dashboard routes
- Restaurant browsing pages
- Customer and owner dashboards
- Flask-based frontend routing
- SQLite database integration

---

# Technologies Used

- Python
- Flask
- SQLite
- HTML5
- CSS3
- JavaScript
- Bootstrap 5

---

# Project Structure

```text
CITS5505_Project/
│
├── app/
│   ├── __init__.py
│   └── routes.py
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── *.html
│
├── instance/
│   └── database.db
│
├── venv/
│
├── mainApp.py
├── requirements.txt
└── README.md
```

---

# Setup Instructions

## 1. Clone the Repository

```bash
git clone <repository-url>
cd CITS5505_Project
```

---

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv
```

### Mac/Linux

```bash
python3 -m venv venv
```

---

## 3. Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

If requirements.txt is unavailable:

```bash
pip install flask werkzeug
```

---

## 5. Run the Flask Server

```bash
python mainApp.py
```

---

## 6. Open the Website

Open this URL in your browser:

```text
http://127.0.0.1:5000/
```

The project should always be opened through Flask instead of opening HTML files directly.

---

# Frontend Routes

| Route | Page |
|------|------|
| `/` | Home Page |
| `/login` | Login Page |
| `/signup` | Signup Page |
| `/restaurants` | Restaurants Page |
| `/reviews` | Reviews Page |
| `/customer-dashboard` | Customer Dashboard |
| `/owner-dashboard` | Owner Dashboard |

---

# Backend API Endpoints

## Health Check

### GET

```text
/api/health
```

### Example Response

```json
{
  "success": true,
  "message": "Backend server is running"
}
```

---

## Register User

### POST

```text
/api/auth/register
```

### Example Request Body

```json
{
  "username": "testuser",
  "password": "1234"
}
```

### Example Success Response

```json
{
  "success": true,
  "message": "Registration successful"
}
```

---

## Login User

### POST

```text
/api/auth/login
```

### Example Request Body

```json
{
  "username": "testuser",
  "password": "1234"
}
```

### Example Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

---

# Session-Based Authentication

The project uses Flask session authentication to manage logged-in users securely.

## Authentication Flow

1. User registers using the `/api/auth/register` endpoint
2. User logs in using the `/api/auth/login` endpoint
3. Flask stores authenticated user information inside the session
4. Protected routes verify if the session exists
5. Unauthenticated users are redirected to the login page
6. Users can log out using the `/logout` route

---

## Protected Routes

The following routes require authentication:

| Route | Access |
|------|------|
| `/customer-dashboard` | Logged-in users only |
| `/owner-dashboard` | Logged-in users only |

If a user is not authenticated, Flask redirects them to:

```text
/login
```

---

## Authentication Status Endpoint

### GET

```text
/api/auth/status
```

### Example Logged-In Response

```json
{
  "authenticated": true,
  "username": "testuser"
}
```

### Example Logged-Out Response

```json
{
  "authenticated": false
}
```

---

## Logout Route

### GET

```text
/logout
```

### Example Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

# Authentication Features

The project currently supports:

- Password hashing using Werkzeug
- Secure login validation
- Flask session management
- Protected dashboard routes
- Logout support
- Session status endpoint
- Basic input validation

Passwords are never stored as plain text inside the database.

---

## Authentication Validation

The backend authentication system includes validation checks to improve reliability and prevent invalid requests.

Current validation features include:

- Empty username and password validation
- Minimum username length validation
- Minimum password length validation
- Duplicate username detection
- Invalid login credential handling

All authentication endpoints return consistent JSON responses using the following structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

# Frontend Routing

Frontend pages are served using Flask routes.

Example routes:

| Route | Page |
|------|------|
| `/` | Home Page |
| `/login` | Login Page |
| `/signup` | Signup Page |
| `/restaurants` | Restaurants Page |
| `/reviews` | Reviews Page |
| `/customer-dashboard` | Customer Dashboard |
| `/owner-dashboard` | Owner Dashboard |

---

# Running Backend Tests

Backend APIs can be tested using:

- Browser Developer Console
- Postman
- Thunder Client (VS Code)

These tools help verify:

- authentication routes
- JSON responses
- session handling
- backend validation

---

## Example Register Test

Open browser console (`F12`) and run:

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test User',
    username: 'newuser',
    password: '1234',
    role: 'customer'
  })
})
.then(res => res.json())
.then(console.log)
```

---

## Example Login Test

```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    password: '1234',
    role: 'customer'
  })
})
.then(res => res.json())
.then(console.log)
```

---

## Example Authentication Status Test

```javascript
fetch('/api/auth/status')
.then(res => res.json())
.then(console.log)
```
---

## Unit Test Coverage

The backend test suite uses `pytest` and Flask’s test client to validate API behaviour and authentication flows.

Current unit tests include:

- Health check API tests
- User registration tests
- User login tests
- Logout/session cleanup tests
- Protected route access tests

---

## Running Unit Tests

Run all backend unit tests:

```bash
pytest tests/
```

Run an individual test file:

```bash
pytest tests/test_login_api.py
```

---

## Testing Notes

- Tests validate JSON API responses and authentication behaviour
- Flask test client is used for backend request simulation
- Authentication and session-based protected routes are verified automatically

---

# Troubleshooting

## Flask Server Not Starting

Make sure the virtual environment is activated before running the project.

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

Then run:

```bash
python mainApp.py
```

---

## ModuleNotFoundError

If Flask or Werkzeug is missing, reinstall dependencies:

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install flask werkzeug
```

---

## Port Already in Use

If port 5000 is already occupied:

Stop the currently running Flask server:

```bash
CTRL + C
```

Then restart:

```bash
python mainApp.py
```

---

## CSS or JavaScript Not Loading

Do not open HTML files directly in the browser.

Always access the project through Flask:

```text
http://127.0.0.1:5000/
```

Opening files directly may break:

- navigation
- CSS loading
- JavaScript functionality

---

## Database Errors

If SQLite database errors occur, ensure the `instance/` folder exists.

Example:

```text
CITS5505_Project/
└── instance/
    └── database.db
```

---

## Login Always Redirects Back to Login Page

Make sure:

- the Flask server is restarted after code changes
- login requests are sent to `/api/auth/login`
- the frontend uses Flask routes such as `/login`
- sessions are enabled using `app.secret_key`

You can verify authentication status here:

```text
http://127.0.0.1:5000/api/auth/status
```

---

## Git Merge Conflicts

Before starting new work:

```bash
git checkout main
git pull
```

Then create a new branch:

```bash
git checkout -b branch-name
```

This helps reduce merge conflicts between team members.

---

# Future Improvements

Potential future enhancements:

- Persistent login sessions
- Restaurant database integration
- Review CRUD functionality
- User profile management
- Role-based authentication
- Better frontend validation
- Responsive mobile improvements
- Admin dashboard
- Password reset functionality

---

# Notes

- SQLite is currently used for local development.
- Flask sessions manage authentication state.
- Frontend assets are served through Flask routes.
- Passwords are securely hashed before storage.
- Protected routes require active user sessions.