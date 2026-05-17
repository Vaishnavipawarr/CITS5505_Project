from flask import Flask
from app.routes import routes
import os

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../frontend",
    static_url_path=""
)

# Create uploads directory if it doesn't exist
upload_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads', 'avatars')
os.makedirs(upload_dir, exist_ok=True)

# Secret key for sessions
app.secret_key = "dev-secret-key"

# Register blueprint
app.register_blueprint(routes)