from flask import Flask
from db import db

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'secret123'

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "Backend working"

if __name__ == "__main__":
    app.run(debug=True)