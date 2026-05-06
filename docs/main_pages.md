# Application Pages

This document outlines the main pages of the web application 
for initial planning and development.

## Pages

* Login / Logout Page
* Sign Up Page
* Home Page
* Profile Page (Customer / Restaurant Owner)
* Reviews Page
* Customer Dashboard
* Restaurant Owner Dashboard

## Page Descriptions

### Login / Logout Page
Users can log in by selecting their role (Customer or Restaurant Owner)
and entering their credentials. Logging out clears the session and 
redirects to the login page.

### Sign Up Page
New users can register by selecting their role. Customers provide 
their name and email. Restaurant owners additionally provide their 
restaurant name.

### Home Page
Public landing page showing featured restaurants, search, and 
a summary of recent reviews. Visible to all users without login.

### Profile Page (Customer / Restaurant Owner)
Displays user information based on role.
- Customer: name, number of reviews written
- Restaurant Owner: restaurant name, average rating, total reviews

### Reviews Page
Public page showing all reviews across all restaurants. 
Visitors can filter by restaurant, rating, and search by keyword.

### Customer Dashboard
Accessible only after login as a Customer.
- Write a new review
- Edit their own reviews
- Delete their own reviews
- Browse all reviews from other users

### Restaurant Owner Dashboard
Accessible only after login as a Restaurant Owner.
- View reviews for their restaurant only
- Reply to customer reviews
- Edit their existing replies
- See basic stats like average rating and pending replies
