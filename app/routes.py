from app import app
from flask import render_template


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/signup')
def signup():
    return render_template('signup.html')


@app.route('/customer-dashboard')
def customer_dashboard():
    return render_template('customer-dashboard.html')


@app.route('/owner-dashboard')
def owner_dashboard():
    return render_template('owner-dashboard.html')


@app.route('/restaurants')
def restaurants():
    return render_template('restaurants.html')


@app.route('/reviews')
def reviews():
    return render_template('reviews.html')