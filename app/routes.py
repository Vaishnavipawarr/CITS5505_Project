from flask import Blueprint, request, jsonify, send_from_directory, session, redirect
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import json
from datetime import datetime

routes = Blueprint('routes', __name__)

# -----------------------------
# API HEALTH CHECK
# -----------------------------

@routes.route('/api/health')
def health_check():

    return jsonify({
        "success": True,
        "message": "Backend server is running",
        "timestamp": datetime.now().isoformat()
    }), 200


# -----------------------------
# FRONTEND PATHS
# -----------------------------

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

CSS_DIR = os.path.join(FRONTEND_DIR, 'css')
JS_DIR = os.path.join(FRONTEND_DIR, 'js')


# -----------------------------
# STATIC FILE ROUTES
# -----------------------------

@routes.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(CSS_DIR, filename)


@routes.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(JS_DIR, filename)


# -----------------------------
# FRONTEND PAGE ROUTES
# -----------------------------

@routes.route('/')
def home():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@routes.route('/login')
def login_page():
    return send_from_directory(FRONTEND_DIR, 'login.html')


@routes.route('/signup')
def signup_page():
    return send_from_directory(FRONTEND_DIR, 'signup.html')


@routes.route('/restaurants')
def restaurants_page():
    return send_from_directory(FRONTEND_DIR, 'restaurants.html')


@routes.route('/reviews')
def reviews_page():
    return send_from_directory(FRONTEND_DIR, 'reviews.html')


# -----------------------------
# PROTECTED ROUTES
# -----------------------------

@routes.route('/customer-dashboard')
def customer_dashboard():

    if "user_id" not in session:
        return redirect('/login')

    return send_from_directory(FRONTEND_DIR, 'customer-dashboard.html')


@routes.route('/owner-dashboard')
def owner_dashboard():

    if "user_id" not in session:
        return redirect('/login')

    return send_from_directory(
        FRONTEND_DIR,
        'owner-dashboard.html'
    )

# -----------------------------
# DATABASE
# -----------------------------

DATABASE = os.path.join(BASE_DIR, 'instance', 'database.db')


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------------
# CREATE USERS TABLE
# -----------------------------

def create_users_table():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()


def create_restaurants_table():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cuisine TEXT,
    price TEXT,
    rating REAL,
    review_count INTEGER DEFAULT 0,
    city TEXT,
    image TEXT,
    owner_id INTEGER,
    FOREIGN KEY(owner_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()


def create_reviews_table():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    restaurant_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    tags TEXT,
    date TEXT,
    customer_name TEXT,
    customer_avatar TEXT,
    restaurant_name TEXT,
    restaurant_img TEXT,
    owner_reply TEXT,
    owner_reply_date TEXT,
    FOREIGN KEY(customer_id) REFERENCES users(id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    )
    """)

    conn.commit()
    conn.close()


def seed_restaurants():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) AS count FROM restaurants")
    if cursor.fetchone()["count"] > 0:
        conn.close()
        return

    restaurants = [
        {
            "id": "r1",
            "name": "Ember & Oak",
            "cuisine": "Steakhouse",
            "price": "$$$$",
            "rating": 4.7,
            "review_count": 312,
            "city": "The Rocks, Sydney",
            "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
        },
        {
            "id": "r2",
            "name": "Spice Garden",
            "cuisine": "Indian",
            "price": "$$$",
            "rating": 4.8,
            "review_count": 341,
            "city": "Haymarket, Sydney",
            "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&q=80"
        },
        {
            "id": "r3",
            "name": "Kyoto Ramen Bar",
            "cuisine": "Japanese",
            "price": "$$",
            "rating": 4.9,
            "review_count": 287,
            "city": "CBD, Sydney",
            "image": "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&q=80"
        },
        {
            "id": "r4",
            "name": "Pizza Palace",
            "cuisine": "Italian",
            "price": "$$",
            "rating": 4.5,
            "review_count": 208,
            "city": "Surry Hills, Sydney",
            "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
        },
        {
            "id": "r5",
            "name": "Burger Hub",
            "cuisine": "American",
            "price": "$$",
            "rating": 4.3,
            "review_count": 176,
            "city": "Newtown, Sydney",
            "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80"
        },
        {
            "id": "r6",
            "name": "Sea Salt & Citrus",
            "cuisine": "Seafood",
            "price": "$$$$",
            "rating": 4.6,
            "review_count": 129,
            "city": "Manly, Sydney",
            "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80"
        }
    ]

    for restaurant in restaurants:
        cursor.execute(
            "INSERT OR IGNORE INTO restaurants (id, name, cuisine, price, rating, review_count, city, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                restaurant["id"],
                restaurant["name"],
                restaurant["cuisine"],
                restaurant["price"],
                restaurant["rating"],
                restaurant["review_count"],
                restaurant["city"],
                restaurant["image"],
            ),
        )

    conn.commit()
    conn.close()


create_users_table()
create_restaurants_table()
create_reviews_table()
seed_restaurants()


# -----------------------------
# REGISTER API
# -----------------------------

@routes.route('/api/auth/register', methods=['POST'])
def register():

    data = request.get_json()

    name = data.get("name")
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "customer")

    # Validation
    if not name:
        return jsonify({
        "success": False,
        "message": "Name is required"
        }), 400

    # Input validation
    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required"
    }), 400

    username = username.strip()

    if len(username) < 3:
        return jsonify({
        "success": False,
        "message": "Username must be at least 3 characters"
    }), 400

    if len(password) < 4:
        return jsonify({
        "success": False,
        "message": "Password must be at least 4 characters"
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
        "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
        (name, username, hashed_password, role)
    )

    conn.commit()
    user_id = cursor.lastrowid

    restaurant_id = None
    if role == "owner":
        restaurant_name = data.get("restaurant_name") or f"{name}'s Restaurant"
        cuisine = data.get("cuisine") or ""
        city = data.get("city") or ""
        restaurant_id = f"owner{user_id}"

        cursor.execute(
            "INSERT INTO restaurants (id, name, cuisine, price, rating, review_count, city, image, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                restaurant_id,
                restaurant_name,
                cuisine,
                "$$",
                0.0,
                0,
                city,
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
                user_id,
            ),
        )
        conn.commit()

    conn.close()

    session["user_id"] = user_id
    session["username"] = username

    return jsonify({
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": user_id,
            "username": username,
            "name": name,
            "role": role,
            "restaurantId": restaurant_id,
        }
    })


# -----------------------------
# LOGIN API
# -----------------------------

@routes.route('/api/auth/login', methods=['POST'])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    # Validation
    if not username or not password:
        return jsonify({
        "success": False,
        "message": "Username and password are required"
    }), 400

    username = username.strip()

    if len(username) < 3:
        return jsonify({
        "success": False,
        "message": "Invalid username"
    }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Find user
    cursor.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    )

    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

    stored_password = user[3]  # Password is the 4th column on table users (index 3)

    if not check_password_hash(stored_password, password):
        conn.close()
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

    restaurant_id = None
    if user[4] == "owner":
        cursor.execute(
            "SELECT id FROM restaurants WHERE owner_id = ?",
            (user[0],)
        )
        restaurant = cursor.fetchone()
        restaurant_id = restaurant["id"] if restaurant else None

    conn.close()

    session["user_id"] = user[0]
    session["username"] = user[2]

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user[0],
            "name": user[1],
            "username": user[2],
            "role": user[4],
            "restaurantId": restaurant_id
        }
    })


# -----------------------------
# LOGOUT ROUTE
# -----------------------------

@routes.route('/logout')
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200


# -----------------------------
# AUTH STATUS ROUTE
# -----------------------------

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return None

    restaurant_id = None
    if user["role"] == "owner":
        cursor.execute("SELECT id FROM restaurants WHERE owner_id = ?", (user_id,))
        restaurant = cursor.fetchone()
        restaurant_id = restaurant["id"] if restaurant else None

    conn.close()
    return {
        "id": user["id"],
        "name": user["name"],
        "username": user["username"],
        "role": user["role"],
        "restaurantId": restaurant_id,
    }


@routes.route('/api/auth/status')
def auth_status():

    user = get_current_user()
    if user:
        return jsonify({
            "authenticated": True,
            "user": user
        }), 200

    return jsonify({
        "authenticated": False
    }), 200


@routes.route('/api/restaurants')
def get_restaurants():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM restaurants")
    restaurants = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(restaurants), 200


@routes.route('/api/reviews')
def list_reviews():
    restaurant_id = request.args.get("restaurant_id")
    customer_id = request.args.get("customer_id")

    query = "SELECT * FROM reviews"
    filters = []
    params = []

    if restaurant_id:
        filters.append("restaurant_id = ?")
        params.append(restaurant_id)
    if customer_id:
        filters.append("customer_id = ?")
        params.append(customer_id)

    if filters:
        query += " WHERE " + " AND ".join(filters)

    query += " ORDER BY id DESC"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, tuple(params))
    reviews = []
    for row in cursor.fetchall():
        review = dict(row)
        review["tags"] = json.loads(review["tags"] or "[]")
        reviews.append(review)
    conn.close()
    return jsonify(reviews), 200


@routes.route('/api/reviews', methods=["POST"])
def create_review():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json()
    restaurant_id = data.get("restaurantId") or data.get("restaurant_id")
    rating = data.get("rating")
    text = data.get("text")
    tags = data.get("tags") or []

    if not restaurant_id or not text or rating is None:
        return jsonify({"success": False, "message": "Restaurant, rating and text are required"}), 400

    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Invalid rating"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM restaurants WHERE id = ?", (restaurant_id,))
    restaurant = cursor.fetchone()
    if not restaurant:
        conn.close()
        return jsonify({"success": False, "message": "Restaurant not found"}), 404

    cursor.execute("SELECT * FROM users WHERE id = ?", (session["user_id"],))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"success": False, "message": "User not found"}), 404

    avatar_index = (user["id"] % 70) + 1
    customer_avatar = f"https://i.pravatar.cc/80?img={avatar_index}"
    date_text = datetime.now().strftime("%b %d, %Y")
    cursor.execute(
        "INSERT INTO reviews (customer_id, restaurant_id, rating, text, tags, date, customer_name, customer_avatar, restaurant_name, restaurant_img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            user["id"],
            restaurant_id,
            rating,
            text,
            json.dumps(tags or []),
            date_text,
            user["name"],
            customer_avatar,
            restaurant["name"],
            restaurant["image"],
        ),
    )
    conn.commit()
    review_id = cursor.lastrowid

    cursor.execute("SELECT COUNT(*) AS count, AVG(rating) AS avg_rating FROM reviews WHERE restaurant_id = ?", (restaurant_id,))
    stats = cursor.fetchone()
    cursor.execute(
        "UPDATE restaurants SET review_count = ?, rating = ? WHERE id = ?",
        (
            stats["count"],
            stats["avg_rating"] or 0,
            restaurant_id,
        ),
    )
    conn.commit()

    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    new_review = dict(cursor.fetchone())
    new_review["tags"] = json.loads(new_review["tags"] or "[]")
    conn.close()
    return jsonify({"success": True, "review": new_review}), 201


@routes.route('/api/reviews/<int:review_id>', methods=["PUT"])
def update_review(review_id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json()
    rating = data.get("rating")
    text = data.get("text")
    tags = data.get("tags") or []

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    review = cursor.fetchone()
    if not review:
        conn.close()
        return jsonify({"success": False, "message": "Review not found"}), 404
    if review["customer_id"] != session["user_id"]:
        conn.close()
        return jsonify({"success": False, "message": "Forbidden"}), 403

    updates = []
    params = []
    if rating is not None:
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            conn.close()
            return jsonify({"success": False, "message": "Invalid rating"}), 400
        updates.append("rating = ?")
        params.append(rating)
    if text is not None:
        updates.append("text = ?")
        params.append(text)
    if tags is not None:
        updates.append("tags = ?")
        params.append(json.dumps(tags or []))

    if updates:
        params.append(review_id)
        cursor.execute(f"UPDATE reviews SET {', '.join(updates)} WHERE id = ?", tuple(params))
        conn.commit()

    cursor.execute("SELECT COUNT(*) AS count, AVG(rating) AS avg_rating FROM reviews WHERE restaurant_id = ?", (review["restaurant_id"],))
    stats = cursor.fetchone()
    cursor.execute(
        "UPDATE restaurants SET review_count = ?, rating = ? WHERE id = ?",
        (
            stats["count"],
            stats["avg_rating"] or 0,
            review["restaurant_id"],
        ),
    )
    conn.commit()

    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    updated_review = dict(cursor.fetchone())
    updated_review["tags"] = json.loads(updated_review["tags"] or "[]")
    conn.close()
    return jsonify({"success": True, "review": updated_review}), 200


@routes.route('/api/reviews/<int:review_id>', methods=["DELETE"])
def delete_review(review_id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    review = cursor.fetchone()
    if not review:
        conn.close()
        return jsonify({"success": False, "message": "Review not found"}), 404
    if review["customer_id"] != session["user_id"]:
        conn.close()
        return jsonify({"success": False, "message": "Forbidden"}), 403

    restaurant_id = review["restaurant_id"]
    cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    conn.commit()

    cursor.execute("SELECT COUNT(*) AS count, AVG(rating) AS avg_rating FROM reviews WHERE restaurant_id = ?", (restaurant_id,))
    stats = cursor.fetchone()
    cursor.execute(
        "UPDATE restaurants SET review_count = ?, rating = ? WHERE id = ?",
        (
            stats["count"],
            stats["avg_rating"] or 0,
            restaurant_id,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True}), 200


@routes.route('/api/reviews/<int:review_id>/reply', methods=["PUT"])
def reply_review(review_id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json()
    owner_reply = data.get("ownerReply") or data.get("reply")
    if not owner_reply:
        return jsonify({"success": False, "message": "Reply text is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    review = cursor.fetchone()
    if not review:
        conn.close()
        return jsonify({"success": False, "message": "Review not found"}), 404

    cursor.execute("SELECT owner_id FROM restaurants WHERE id = ?", (review["restaurant_id"],))
    restaurant = cursor.fetchone()
    if not restaurant or restaurant["owner_id"] != session["user_id"]:
        conn.close()
        return jsonify({"success": False, "message": "Forbidden"}), 403

    reply_date = datetime.now().strftime("%b %d, %Y")
    cursor.execute(
        "UPDATE reviews SET owner_reply = ?, owner_reply_date = ? WHERE id = ?",
        (owner_reply, reply_date, review_id),
    )
    conn.commit()

    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    updated_review = dict(cursor.fetchone())
    updated_review["tags"] = json.loads(updated_review["tags"] or "[]")
    conn.close()
    return jsonify({"success": True, "review": updated_review}), 200