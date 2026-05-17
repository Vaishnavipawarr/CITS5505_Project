from flask import Blueprint, request, jsonify, send_from_directory, session, redirect, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3
import os
import json
import secrets
from datetime import datetime
from pathlib import Path

routes = Blueprint('routes', __name__)

def log_info(message):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"[INFO] [{timestamp}] {message}")


def log_error(message):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"[ERROR] [{timestamp}] {message}")

# -----------------------------
# CSRF PROTECTION
# -----------------------------

@routes.before_request
def csrf_protect():
    # Require CSRF token for mutating requests, exempting auth to prevent blocking login/signup
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        if request.path in ['/api/auth/login', '/api/auth/register']:
            return
            
        token = session.get("csrf_token")
        request_token = request.headers.get("X-CSRFToken")
        
        if not token or not request_token or token != request_token:
            return jsonify({"success": False, "message": "CSRF token missing or incorrect"}), 403

@routes.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_hex(32)
    return jsonify({"csrfToken": session["csrf_token"]})

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
    return render_template('index.html')


@routes.route('/login')
def login_page():
    return render_template('login.html')


@routes.route('/signup')
def signup_page():
    return render_template('signup.html')


@routes.route('/restaurants')
def restaurants_page():
    return render_template('restaurants.html')


@routes.route('/reviews')
def reviews_page():
    return render_template('reviews.html')

# -----------------------------
# PROTECTED ROUTES
# -----------------------------

@routes.route('/customer-dashboard')
def customer_dashboard():

    if "user_id" not in session:
        return redirect('/login')

    return render_template('customer-dashboard.html')


@routes.route('/owner-dashboard')
def owner_dashboard():

    if "user_id" not in session:
        return redirect('/login')

    return render_template('owner-dashboard.html')

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
    role TEXT NOT NULL,
    profile_pic TEXT
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
    bio TEXT,
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


# -----------------------------
# DATABASE MIGRATIONS
# -----------------------------

def migrate_users_table():
    """Add profile_pic column if it doesn't exist"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if profile_pic column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if "profile_pic" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN profile_pic TEXT")
        conn.commit()
    
    conn.close()


def migrate_restaurants_table():
    """Add bio column if it doesn't exist"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if bio column exists
    cursor.execute("PRAGMA table_info(restaurants)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if "bio" not in columns:
        cursor.execute("ALTER TABLE restaurants ADD COLUMN bio TEXT")
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
migrate_users_table()
migrate_restaurants_table()
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

    log_info(f"Registration attempt for username: {username}")

    # Validation
    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required"
        }), 400

    if not username or not password:
        log_error("Registration failed due to missing username or password")
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
        log_error(f"Duplicate registration attempt: {username}")
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

    # Create restaurant automatically for owner accounts
    if role == "owner":

        restaurant_name = data.get("restaurant_name") or f"{name}'s Restaurant"
        cuisine = data.get("cuisine") or ""
        city = data.get("city") or ""

        restaurant_id = f"owner{user_id}"

        cursor.execute(
            """
            INSERT INTO restaurants
            (id, name, cuisine, price, rating, review_count, city, image, owner_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
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

    # SAVE SESSION AFTER REGISTER
    session["user_id"] = user_id
    session["username"] = username
    session["role"] = role

    log_info(f"User registered successfully: {username}")

    return jsonify({
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": user_id,
            "username": username,
            "name": name,
            "role": role,
            "profilePic": None,
            "restaurantId": restaurant_id,
}
        }
    }), 201

# -----------------------------
# LOGIN API
# -----------------------------

@routes.route('/api/auth/login', methods=['POST'])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    log_info(f"Login attempt for username: {username}")

    # Validation
    if not username or not password:
        log_error("Login failed due to missing username or password")
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
    session["role"] = user[4]
    
    log_info(f"Login successful for username: {username}")

    profile_pic = user[5] if len(user) > 5 else None
    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user[0],
            "name": user[1],
            "username": user[2],
            "role": user[4],
            "profilePic": profile_pic,
            "restaurantId": restaurant_id
        }
    })


# -----------------------------
# LOGOUT ROUTE
# -----------------------------

@routes.route('/logout')
def logout():

    log_info(f"User logged out and session cleared")
    
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
        "profilePic": user["profile_pic"],
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


def get_review_by_id(cursor, review_id):
    query = """
        SELECT r.*, 
               u.profile_pic AS current_customer_avatar, u.name AS current_customer_name,
               rest.image AS current_restaurant_img, rest.name AS current_restaurant_name
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.id
        LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
        WHERE r.id = ?
    """
    cursor.execute(query, (review_id,))
    row = cursor.fetchone()
    if not row:
        return None
    
    review = dict(row)
    if review.get("current_customer_avatar"):
        review["customer_avatar"] = review["current_customer_avatar"]
    if review.get("current_customer_name"):
        review["customer_name"] = review["current_customer_name"]
    if review.get("current_restaurant_img"):
        review["restaurant_img"] = review["current_restaurant_img"]
    if review.get("current_restaurant_name"):
        review["restaurant_name"] = review["current_restaurant_name"]
        
    review.pop("current_customer_avatar", None)
    review.pop("current_customer_name", None)
    review.pop("current_restaurant_img", None)
    review.pop("current_restaurant_name", None)
    
    review["tags"] = json.loads(review["tags"] or "[]")
    return review

@routes.route('/api/reviews')
def list_reviews():
    restaurant_id = request.args.get("restaurant_id")
    customer_id = request.args.get("customer_id")

    query = """
        SELECT r.*, 
               u.profile_pic AS current_customer_avatar, u.name AS current_customer_name,
               rest.image AS current_restaurant_img, rest.name AS current_restaurant_name
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.id
        LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
    """
    filters = []
    params = []

    if restaurant_id:
        filters.append("r.restaurant_id = ?")
        params.append(restaurant_id)
    if customer_id:
        filters.append("r.customer_id = ?")
        params.append(customer_id)

    if filters:
        query += " WHERE " + " AND ".join(filters)

    query += " ORDER BY r.id DESC"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, tuple(params))
    reviews = []
    for row in cursor.fetchall():
        review = dict(row)
        
        if review.get("current_customer_avatar"):
            review["customer_avatar"] = review["current_customer_avatar"]
        if review.get("current_customer_name"):
            review["customer_name"] = review["current_customer_name"]
        if review.get("current_restaurant_img"):
            review["restaurant_img"] = review["current_restaurant_img"]
        if review.get("current_restaurant_name"):
            review["restaurant_name"] = review["current_restaurant_name"]
            
        review.pop("current_customer_avatar", None)
        review.pop("current_customer_name", None)
        review.pop("current_restaurant_img", None)
        review.pop("current_restaurant_name", None)

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
    customer_avatar = user["profile_pic"] or f"https://i.pravatar.cc/80?img={avatar_index}"
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

    updated_review = get_review_by_id(cursor, review_id)
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


# -----------------------------
# PROFILE PICTURE UPLOAD
# -----------------------------

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads', 'avatars')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_dir():
    Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)


@routes.route('/api/auth/upload-avatar', methods=['POST'])
def upload_avatar():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    # Check for avatar_url in JSON or form data
    avatar_url = None
    if request.is_json:
        avatar_url = request.get_json().get('avatar_url')
    else:
        avatar_url = request.form.get('avatar_url')

    if avatar_url:
        try:
            profile_pic_path = avatar_url
            conn = get_db()
            cursor = conn.cursor()
            
            # Get old profile pic to delete it if it's local
            cursor.execute("SELECT profile_pic FROM users WHERE id = ?", (session["user_id"],))
            user_data = cursor.fetchone()
            
            if user_data and user_data["profile_pic"]:
                old_pic_path = user_data["profile_pic"]
                if old_pic_path.startswith("/uploads/avatars/"):
                    old_filename = old_pic_path.split("/")[-1]
                    old_filepath = os.path.join(UPLOAD_FOLDER, old_filename)
                    if os.path.exists(old_filepath):
                        try:
                            os.remove(old_filepath)
                        except Exception as e:
                            print(f"Failed to delete old avatar: {e}")

            cursor.execute("UPDATE users SET profile_pic = ? WHERE id = ?", (profile_pic_path, session["user_id"]))
            cursor.execute("UPDATE reviews SET customer_avatar = ? WHERE customer_id = ?", (profile_pic_path, session["user_id"]))
            cursor.execute("UPDATE restaurants SET image = ? WHERE owner_id = ?", (profile_pic_path, session["user_id"]))
            cursor.execute("UPDATE reviews SET restaurant_img = ? WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = ?)", (profile_pic_path, session["user_id"]))
            conn.commit()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Avatar updated successfully via URL",
                "profilePic": profile_pic_path
            }), 200
        except Exception as e:
            return jsonify({"success": False, "message": f"Update failed: {str(e)}"}), 500

    if 'avatar' not in request.files:
        return jsonify({"success": False, "message": "No file or URL provided"}), 400

    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Only JPG, PNG, GIF, WEBP images allowed"}), 400

    try:
        ensure_upload_dir()
        filename = secure_filename(f"avatar_{session['user_id']}_{datetime.now().timestamp()}.{file.filename.rsplit('.', 1)[1].lower()}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        profile_pic_path = f"/uploads/avatars/{filename}"
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Get old profile pic to delete it
        cursor.execute("SELECT profile_pic FROM users WHERE id = ?", (session["user_id"],))
        user_data = cursor.fetchone()
        
        if user_data and user_data["profile_pic"]:
            old_pic_path = user_data["profile_pic"]
            # Check if it's a locally uploaded file
            if old_pic_path.startswith("/uploads/avatars/"):
                old_filename = old_pic_path.split("/")[-1]
                old_filepath = os.path.join(UPLOAD_FOLDER, old_filename)
                if os.path.exists(old_filepath):
                    try:
                        os.remove(old_filepath)
                    except Exception as e:
                        print(f"Failed to delete old avatar: {e}")

        cursor.execute("UPDATE users SET profile_pic = ? WHERE id = ?", (profile_pic_path, session["user_id"]))
        cursor.execute("UPDATE reviews SET customer_avatar = ? WHERE customer_id = ?", (profile_pic_path, session["user_id"]))
        cursor.execute("UPDATE restaurants SET image = ? WHERE owner_id = ?", (profile_pic_path, session["user_id"]))
        cursor.execute("UPDATE reviews SET restaurant_img = ? WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = ?)", (profile_pic_path, session["user_id"]))
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Avatar uploaded successfully",
            "profilePic": profile_pic_path
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Upload failed: {str(e)}"}), 500


# -----------------------------
# RESTAURANT BIO UPDATE
# -----------------------------

@routes.route('/api/restaurants/<restaurant_id>/bio', methods=['PUT'])
def update_restaurant_bio(restaurant_id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json()
    bio = data.get("bio", "").strip()

    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT owner_id FROM restaurants WHERE id = ?", (restaurant_id,))
    restaurant = cursor.fetchone()
    
    if not restaurant:
        conn.close()
        return jsonify({"success": False, "message": "Restaurant not found"}), 404
    
    if restaurant["owner_id"] != session["user_id"]:
        conn.close()
        return jsonify({"success": False, "message": "Forbidden"}), 403
    
    cursor.execute("UPDATE restaurants SET bio = ? WHERE id = ?", (bio, restaurant_id))
    conn.commit()
    
    cursor.execute("SELECT * FROM restaurants WHERE id = ?", (restaurant_id,))
    updated_restaurant = dict(cursor.fetchone())
    conn.close()
    
    return jsonify({
        "success": True,
        "message": "Bio updated successfully",
        "restaurant": updated_restaurant
    }), 200


# -----------------------------
# RESTAURANT PRICE UPDATE
# -----------------------------

@routes.route('/api/restaurants/<restaurant_id>/price', methods=['PUT'])
def update_restaurant_price(restaurant_id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json()
    price = data.get("price", "").strip()
    
    # Validate the budget format
    valid_prices = ["$", "$$", "$$$", "$$$$"]
    if price not in valid_prices:
        return jsonify({"success": False, "message": "Invalid price format. Must be $, $$, $$$, or $$$$"}), 400

    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT owner_id FROM restaurants WHERE id = ?", (restaurant_id,))
    restaurant = cursor.fetchone()
    
    if not restaurant:
        conn.close()
        return jsonify({"success": False, "message": "Restaurant not found"}), 404
    
    if restaurant["owner_id"] != session["user_id"]:
        conn.close()
        return jsonify({"success": False, "message": "Forbidden"}), 403
    
    cursor.execute("UPDATE restaurants SET price = ? WHERE id = ?", (price, restaurant_id))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Budget updated successfully"}), 200


# Serve uploaded avatars
@routes.route('/uploads/avatars/<filename>')
def serve_avatar(filename):
    return send_from_directory(UPLOAD_FOLDER, secure_filename(filename))