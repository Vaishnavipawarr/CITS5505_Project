# API Reference — Fork & Flame

**Base URL:** `http://127.0.0.1:5000`  
**Content-Type:** `application/json` (for all POST and PUT requests)  
**Authentication:** Session-based (Flask sessions via HTTP cookies)

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [Authentication](#2-authentication)
   - [Register](#21-register-user)
   - [Login](#22-login-user)
   - [Logout](#23-logout-user)
   - [Session Status](#24-session-status)
3. [Restaurants](#3-restaurants) *(planned)*
   - [List Restaurants](#31-list-restaurants)
   - [Get Restaurant](#32-get-single-restaurant)
   - [Create Restaurant](#33-create-restaurant)
   - [Update Restaurant](#34-update-restaurant)
   - [Delete Restaurant](#35-delete-restaurant)
4. [Reviews](#4-reviews) *(planned)*
   - [List Reviews](#41-list-reviews-for-a-restaurant)
   - [Create Review](#42-create-review)
   - [Update Review](#43-update-review)
   - [Delete Review](#44-delete-review)
5. [Frontend Routes](#5-frontend-routes)
6. [Error Response Format](#6-error-response-format)

---

## 1. Health Check

### `GET /api/health`

Checks whether the backend server is running. Useful for verifying the Flask app started correctly.

**Authentication required:** No

**Request body:** None

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Backend server is running",
  "timestamp": "2025-05-07T13:03:00.000000+00:00"
}
```

---

## 2. Authentication

### 2.1 Register User

### `POST /api/auth/register`

Creates a new user account. Passwords are hashed with Werkzeug before storage — plain text is never saved.

**Authentication required:** No

**Request body**

| Field      | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `username` | string | Yes      | Unique username           |
| `password` | string | Yes      | Plain text password       |

```json
{
  "username": "riya123",
  "password": "mypassword"
}
```

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Registration successful"
}
```

**Error responses**

| Status | Condition              | Message                              |
|--------|------------------------|--------------------------------------|
| `400`  | Missing fields         | `"Username and password are required"` |
| `400`  | Username already taken | `"User already exists"`              |

```json
{
  "success": false,
  "message": "User already exists"
}
```

---

### 2.2 Login User

### `POST /api/auth/login`

Authenticates a user and creates a server-side session. The session cookie is returned automatically and required for protected routes.

**Authentication required:** No

**Request body**

| Field      | Type   | Required | Description        |
|------------|--------|----------|--------------------|
| `username` | string | Yes      | Registered username |
| `password` | string | Yes      | Plain text password |

```json
{
  "username": "riya123",
  "password": "mypassword"
}
```

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "riya123"
  }
}
```

**Error responses**

| Status | Condition                    | Message                              |
|--------|------------------------------|--------------------------------------|
| `400`  | Missing fields               | `"Username and password are required"` |
| `401`  | Wrong username or password   | `"Invalid username or password"`     |

---

### 2.3 Logout User

### `GET /logout`

Clears the current user's session. The user is no longer authenticated after this call.

**Authentication required:** No (but only meaningful when logged in)

**Request body:** None

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2.4 Session Status

### `GET /api/auth/status`

Returns whether the current request is from an authenticated session. Call this on page load to conditionally show login/logout UI.

**Authentication required:** No

**Request body:** None

**Response when logged in — `200 OK`**

```json
{
  "authenticated": true,
  "username": "riya123"
}
```

**Response when logged out — `200 OK`**

```json
{
  "authenticated": false
}
```

---

## 3. Restaurants

> **Status: Planned.** These endpoints do not yet exist in `routes.py`. They correspond to Issue #3 in the project backlog. The schemas below are the agreed design for this sprint.

### 3.1 List Restaurants

### `GET /api/restaurants`

Returns all restaurants in the database.

**Authentication required:** No

**Query parameters:** None (filtering by cuisine or name can be added later)

**Success response — `200 OK`**

```json
{
  "success": true,
  "restaurants": [
    {
      "id": 1,
      "name": "The Flame Grill",
      "cuisine": "BBQ",
      "address": "12 King St, Perth WA",
      "description": "Wood-fired grills since 1998",
      "average_rating": 4.3,
      "owner_id": 2
    }
  ]
}
```

---

### 3.2 Get Single Restaurant

### `GET /api/restaurants/<id>`

Returns a single restaurant by its ID, including its average star rating.

**Authentication required:** No

**URL parameters**

| Parameter | Type    | Description       |
|-----------|---------|-------------------|
| `id`      | integer | Restaurant ID     |

**Success response — `200 OK`**

```json
{
  "success": true,
  "restaurant": {
    "id": 1,
    "name": "The Flame Grill",
    "cuisine": "BBQ",
    "address": "12 King St, Perth WA",
    "description": "Wood-fired grills since 1998",
    "average_rating": 4.3,
    "owner_id": 2
  }
}
```

**Error responses**

| Status | Condition           | Message                    |
|--------|---------------------|----------------------------|
| `404`  | ID does not exist   | `"Restaurant not found"`   |

---

### 3.3 Create Restaurant

### `POST /api/restaurants`

Creates a new restaurant profile. Only users with `role: owner` may call this endpoint.

**Authentication required:** Yes (owner role)

**Request body**

| Field         | Type   | Required | Description                     |
|---------------|--------|----------|---------------------------------|
| `name`        | string | Yes      | Restaurant name                  |
| `cuisine`     | string | Yes      | Cuisine type (e.g. Italian, BBQ) |
| `address`     | string | Yes      | Physical address                 |
| `description` | string | No       | Short description                |

```json
{
  "name": "The Flame Grill",
  "cuisine": "BBQ",
  "address": "12 King St, Perth WA",
  "description": "Wood-fired grills since 1998"
}
```

**Success response — `201 Created`**

```json
{
  "success": true,
  "message": "Restaurant created",
  "restaurant_id": 1
}
```

**Error responses**

| Status | Condition          | Message                         |
|--------|--------------------|---------------------------------|
| `400`  | Missing fields     | `"Name, cuisine and address are required"` |
| `401`  | Not logged in      | `"Authentication required"`     |
| `403`  | Not an owner       | `"Owner account required"`      |

---

### 3.4 Update Restaurant

### `PUT /api/restaurants/<id>`

Updates an existing restaurant. Only the owner who created it may update it.

**Authentication required:** Yes (owner role, must own the restaurant)

**URL parameters**

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| `id`      | integer | Restaurant ID  |

**Request body** — include only the fields you want to change

```json
{
  "description": "Updated description"
}
```

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Restaurant updated"
}
```

**Error responses**

| Status | Condition              | Message                      |
|--------|------------------------|------------------------------|
| `401`  | Not logged in          | `"Authentication required"`  |
| `403`  | Not the owner          | `"Forbidden"`                |
| `404`  | Restaurant not found   | `"Restaurant not found"`     |

---

### 3.5 Delete Restaurant

### `DELETE /api/restaurants/<id>`

Permanently deletes a restaurant and all associated reviews.

**Authentication required:** Yes (owner role, must own the restaurant)

**URL parameters**

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| `id`      | integer | Restaurant ID  |

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Restaurant deleted"
}
```

**Error responses**

| Status | Condition              | Message                      |
|--------|------------------------|------------------------------|
| `401`  | Not logged in          | `"Authentication required"`  |
| `403`  | Not the owner          | `"Forbidden"`                |
| `404`  | Restaurant not found   | `"Restaurant not found"`     |

---

## 4. Reviews

> **Status: Planned.** These endpoints do not yet exist in `routes.py`. They correspond to Issue #2 in the project backlog.

### 4.1 List Reviews for a Restaurant

### `GET /api/reviews`

Returns all reviews for a given restaurant.

**Authentication required:** No

**Query parameters**

| Parameter       | Type    | Required | Description        |
|-----------------|---------|----------|--------------------|
| `restaurant_id` | integer | Yes      | Filter by restaurant |

**Example request**

```
GET /api/reviews?restaurant_id=1
```

**Success response — `200 OK`**

```json
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "user_id": 3,
      "username": "riya123",
      "restaurant_id": 1,
      "rating": 5,
      "body": "Amazing food and great service!",
      "created_at": "2025-05-07T13:00:00"
    }
  ]
}
```

**Error responses**

| Status | Condition                  | Message                           |
|--------|----------------------------|-----------------------------------|
| `400`  | Missing `restaurant_id`    | `"restaurant_id is required"`     |

---

### 4.2 Create Review

### `POST /api/reviews`

Submits a new review for a restaurant. User must be logged in.

**Authentication required:** Yes

**Request body**

| Field           | Type    | Required | Description              |
|-----------------|---------|----------|--------------------------|
| `restaurant_id` | integer | Yes      | Restaurant being reviewed |
| `rating`        | integer | Yes      | Star rating (1–5)         |
| `body`          | string  | Yes      | Review text               |

```json
{
  "restaurant_id": 1,
  "rating": 5,
  "body": "Amazing food and great service!"
}
```

**Success response — `201 Created`**

```json
{
  "success": true,
  "message": "Review submitted",
  "review_id": 1
}
```

**Error responses**

| Status | Condition              | Message                                  |
|--------|------------------------|------------------------------------------|
| `400`  | Missing fields         | `"restaurant_id, rating and body are required"` |
| `400`  | Rating out of range    | `"Rating must be between 1 and 5"`       |
| `401`  | Not logged in          | `"Authentication required"`              |
| `404`  | Restaurant not found   | `"Restaurant not found"`                 |

---

### 4.3 Update Review

### `PUT /api/reviews/<id>`

Edits an existing review. Only the user who wrote it may edit it.

**Authentication required:** Yes (must own the review)

**URL parameters**

| Parameter | Type    | Description |
|-----------|---------|-------------|
| `id`      | integer | Review ID   |

**Request body** — include only the fields to update

```json
{
  "rating": 4,
  "body": "Updated thoughts after my second visit."
}
```

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Review updated"
}
```

**Error responses**

| Status | Condition            | Message                      |
|--------|----------------------|------------------------------|
| `401`  | Not logged in        | `"Authentication required"`  |
| `403`  | Not the author       | `"Forbidden"`                |
| `404`  | Review not found     | `"Review not found"`         |

---

### 4.4 Delete Review

### `DELETE /api/reviews/<id>`

Permanently deletes a review. Only the author may delete their own review.

**Authentication required:** Yes (must own the review)

**URL parameters**

| Parameter | Type    | Description |
|-----------|---------|-------------|
| `id`      | integer | Review ID   |

**Success response — `200 OK`**

```json
{
  "success": true,
  "message": "Review deleted"
}
```

**Error responses**

| Status | Condition          | Message                      |
|--------|--------------------|------------------------------|
| `401`  | Not logged in      | `"Authentication required"`  |
| `403`  | Not the author     | `"Forbidden"`                |
| `404`  | Review not found   | `"Review not found"`         |

---

## 5. Frontend Routes

These routes serve HTML pages via Flask. They do not return JSON.

| Method | Route                  | Page served                        |
|--------|------------------------|------------------------------------|
| `GET`  | `/`                    | Home page (`index.html`)           |
| `GET`  | `/login`               | Login page (`login.html`)          |
| `GET`  | `/signup`              | Signup page (`signup.html`)        |
| `GET`  | `/restaurants`         | Restaurants page                   |
| `GET`  | `/reviews`             | Reviews page                       |
| `GET`  | `/customer-dashboard`  | Customer dashboard *(auth planned)*|
| `GET`  | `/owner-dashboard`     | Owner dashboard *(auth planned)*   |
| `GET`  | `/css/<filename>`      | Serves static CSS files            |
| `GET`  | `/js/<filename>`       | Serves static JS files             |

---

## 6. Error Response Format

All API error responses follow this consistent structure:

```json
{
  "success": false,
  "message": "Human-readable description of the error"
}
```

### HTTP status codes used in this project

| Code  | Meaning                                                       |
|-------|---------------------------------------------------------------|
| `200` | OK — request succeeded                                        |
| `201` | Created — resource was successfully created                   |
| `400` | Bad Request — missing or invalid fields in the request body   |
| `401` | Unauthorized — user is not logged in                          |
| `403` | Forbidden — user is logged in but lacks permission            |
| `404` | Not Found — the requested resource does not exist             |

---

*Last updated: May 2025 — CITS5505 Agile Web Development, The University of Western Australia*
