from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, UTC

routes = Blueprint('routes', __name__)

#API Health Check

@routes.route('/api/health')
def health_check():
    return jsonify({
        "success": True,
        "message": "Backend server is running",
        "timestamp": datetime.now(UTC).isoformat()
    }), 200

# -----------------------------
# FRONTEND PAGES
# -----------------------------

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FNF_DIR = os.path.join(BASE_DIR, 'fnf')
CSS_DIR = os.path.join(FNF_DIR, 'css')


@routes.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(CSS_DIR, filename)

JS_DIR = os.path.join(FNF_DIR, 'js')


@routes.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(JS_DIR, filename)

# Database path
DATABASE = os.path.join(BASE_DIR, 'instance', 'database.db')

# -----------------------------
# DATABASE CONNECTION
# -----------------------------
def get_db():
    return sqlite3.connect(DATABASE)


# -----------------------------
# CREATE USERS TABLE
# -----------------------------
def create_users_table():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()


# Run table creation once
create_users_table()


# HOME PAGE
@routes.route('/')
def home():
    return send_from_directory(FNF_DIR, 'index.html')


@routes.route('/login')
def login_page():
    return send_from_directory(FNF_DIR, 'login.html')


@routes.route('/signup')
def signup_page():
    return send_from_directory(FNF_DIR, 'signup.html')


@routes.route('/restaurants')
def restaurants_page():
    return send_from_directory(FNF_DIR, 'restaurants.html')


@routes.route('/reviews')
def reviews_page():
    return send_from_directory(FNF_DIR, 'reviews.html')


@routes.route('/customer-dashboard')
def customer_dashboard():
    return send_from_directory(FNF_DIR, 'customer-dashboard.html')


@routes.route('/owner-dashboard')
def owner_dashboard():
    return send_from_directory(FNF_DIR, 'owner-dashboard.html')


# -----------------------------
# REGISTER API
# -----------------------------
@routes.route('/api/auth/register', methods=['POST'])
def register():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    # Input validation
    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check existing user
    cursor.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()

        return jsonify({
            "success": False,
            "message": "User already exists"
        }), 400

    # Hash password
    hashed_password = generate_password_hash(password)

    # Insert user
    cursor.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (username, hashed_password)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Registration successful"
    })


# -----------------------------
# LOGIN API
# -----------------------------
@routes.route('/api/auth/login', methods=['POST'])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    # Input validation
    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Find user
    cursor.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    )

    user = cursor.fetchone()

    conn.close()

    # User not found
    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

    stored_password = user[2]

    # Check hashed password
    if not check_password_hash(stored_password, password):
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user[0],
            "username": user[1]
        }
    })