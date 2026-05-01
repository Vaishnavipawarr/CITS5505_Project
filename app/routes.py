from app import app
from flask import render_template

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/cusProfile')
def profile():
    return render_template('customer-profile.html')

@app.route('/restaurantOverview')
def restaurantOverview():
    return render_template('restaurant-overview.html')

@app.route('/restaurantProfile')
def restaurantProfile():
    return render_template('restaurant-profile.html')

@app.route('/review')
def review():
    return render_template('review.html')