from flask import Flask
from app.routes import routes

app = Flask(
    __name__,
    template_folder="../frontend",
    static_folder="../frontend",
    static_url_path=""
)

# Register blueprint
app.register_blueprint(routes)