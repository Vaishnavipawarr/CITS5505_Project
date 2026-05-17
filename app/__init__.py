import os
from flask import Flask
from app.routes import routes
from dotenv import load_dotenv

load_dotenv()

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../frontend",
    static_url_path=""
)

# Secret key for sessions loaded from environment variable
app.secret_key = os.getenv("SECRET_KEY", "fallback-dev-key")

# Create uploads directory if it doesn't exist
upload_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads', 'avatars')
os.makedirs(upload_dir, exist_ok=True)

# Register blueprint
app.register_blueprint(routes)