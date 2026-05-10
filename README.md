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
- Manage user authentication sessions

The frontend is served through Flask routes instead of opening HTML files directly in the browser.

---

# Features

- User registration and login
- Password hashing using Werkzeug
- Flask session management
- Logout functionality
- Authentication status API
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

This project uses Flask to serve the frontend pages.

## 1. Clone the Repository

```bash
git clone <repository-url>
cd CITS5505_Project
```

---

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv
```

### Mac/Linux

```bash
python3 -m venv .venv
```

---

## 3. Activate the Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source .venv/bin/activate
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

## 5. Run the Flask App

```bash
python mainApp.py
```

---

## 6. Open the Website

Open this URL in your browser:

```text
http://127.0.0.1:5000/
```

Please run the project through the Flask server instead of opening HTML files directly, because the navigation links use Flask routes.

---

# Backend API Endpoints

---

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

## Logout User

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

## Authentication Status

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

# Authentication Features

The project currently supports:

- Password hashing using Werkzeug
- Secure login validation
- Flask session management
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

## Example Login Test

Open browser console (`F12`) and run:

```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    password: '1234'
  })
})
.then(res => res.json())
.then(console.log)
```

---

## Example Register Test

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newuser',
    password: '1234'
  })
})
.then(res => res.json())
.then(console.log)
```

---

# Troubleshooting

---

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

## Login Always Failing

Ensure the user has been registered before login.

You can test registration using:
- Browser Console
- Postman
- Thunder Client

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

- Protected dashboard routes
- Persistent login sessions
- Restaurant database integration
- Review CRUD functionality
- User profile management
- Role-based authentication
- API modularization
- Better frontend validation
- Responsive mobile improvements

---

# Notes

- SQLite is currently used for local development.
- Flask sessions manage authentication state.
- Frontend assets are served through Flask routes.
- Passwords are securely hashed before storage.

---

# License

This project was developed for:

## CITS5505 — Agile Web Development

The University of Western Australia