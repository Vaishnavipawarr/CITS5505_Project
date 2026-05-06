from flask import Flask
from app.routes import routes

app = Flask(__name__)
app.secret_key = "dev-secret-key"

# Register blueprint
app.register_blueprint(routes)