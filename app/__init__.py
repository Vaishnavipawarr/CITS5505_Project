from flask import Flask
from app.routes import routes

app = Flask(__name__)

# Register blueprint
app.register_blueprint(routes)