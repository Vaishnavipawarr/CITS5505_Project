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

# Register blueprint
app.register_blueprint(routes)