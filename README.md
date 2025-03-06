# Tour Management API

## Overview
This API allows users to manage tours, including adding, updating, and deleting tours. It also includes authentication and role-based access control for admins and users.

## Installation
1. Clone the repository:
   ```bash
   https://github.com/Ishwor-stha/travelAndTour.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure necessary environment variables:
   ```env
   PORT=6000
   SECRETKEY=<your-secret-key>
   jwtExpires=1h
   URL=<your-app-url>
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Admin Routes
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/admin/get-admins` | Get all admins (requires authentication) |
| POST | `/admin/create-admin/` | Create a new admin (requires authentication) |
| POST | `/admin/login-admin/` | Login admin and generate JWT token |
| DELETE | `/admin/logout-admin/` | Logout admin by clearing the auth token |
| PATCH | `/admin/update-admin/` | Update admin details (requires authentication) |
| DELETE | `/admin/remove-admin/:id` | Delete an admin by ID (requires authentication) |
| POST | `/admin/forget-password` | Request password reset link |
| PATCH | `/admin/reset-password/:code` | Reset password using the provided code |

### User Routes
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/user/get-users` | Get all users (requires admin authentication) |
| POST | `/user/register` | Register a new user |
| POST | `/user/login` | Login user and generate JWT token |
| DELETE | `/user/logout` | Logout user by clearing the auth token |
| PATCH | `/user/update-user/` | Update user details (requires authentication) |
| DELETE | `/user/remove-user/:id` | Delete a user by ID (requires admin authentication) |


---

## Base URL
The base URL for this API is `http://localhost:6000`. All routes described below are relative to this base.

## Available GET Routes

### 1. **Get All Tours**

#### Endpoint
```
GET /get-tours
```

#### Description
This route returns an array of all available tours. The tours can be filtered and sorted based on query parameters.

#### Query Parameters (optional):
- `page`: The page number to paginate through the tours. Default is `1`.
- `adult_price`: Sorting by the adult price. Accepts `asc` or `desc` values.
- `youth_price`: Sorting by the youth price. Accepts `asc` or `desc` values.
- `popularity`: Sorting by popularity. Accepts `asc` or `desc` values.
- Any of the following fields can be used to filter tours:
  - `placeName`
  - `active_month`
  - `destination`
  - `category`
  - `tour_type`
  - `duration`
  - `name`
  - `country`
  - `district`
  - `pickup_destination`

#### Example Request:
```bash
GET /get-tours?page=2&adult_price=asc&destination=mustang
```

#### Example Response:
```json
{
  "status": "success",
  "tourList": [
    {
      "name": "Mustang Trek",
      "adult_price": 500,
      "youth_price": 300,
      "destination": "Mustang",
      "category": "Trekking",
      "tour_type": "Adventure",
      "duration": "10 days",
      "placeName": "Mustang",
      "active_month": "March"
    },
    {
      "name": "Everest Base Camp",
      "adult_price": 1200,
      "youth_price": 800,
      "destination": "Everest",
      "category": "Trekking",
      "tour_type": "Adventure",
      "duration": "14 days",
      "placeName": "Everest",
      "active_month": "April"
    }
  ]
}
```

---

### 2. **Get a Single Tour by Slug**

#### Endpoint
```
GET /get-tour/:slug
```

#### Description
This route returns the details of a single tour identified by its slug. The slug is a unique identifier for the tour.

#### Path Parameter:
- `slug`: The slug of the tour. This should be a string identifier for a specific tour.

#### Example Request:
```bash
GET /get-tour/everest-base-camp
```

#### Example Response:
```json
{
  "status": "success",
  "tour": {
    "name": "Everest Base Camp",
    "adult_price": 1200,
    "youth_price": 800,
    "destination": "Everest",
    "category": "Trekking",
    "tour_type": "Adventure",
    "duration": "14 days",
    "placeName": "Everest",
    "active_month": "April",
    "description": "A once-in-a-lifetime trekking experience to Everest Base Camp."
  }
}
```

---

## Usage Instructions

### 1. Start the Backend Server
Make sure your backend server is running before trying to access these routes. You can start the server by running:


### 2. Testing GET Routes
You can test these GET routes using tools like **Postman**, **Insomnia**, or any HTTP client of your choice.

For example, to test fetching all tours:

1. Open **Postman**.
2. Set the HTTP method to **GET**.
3. Enter the following URL: `http://localhost:6000/get-tours`.
4. Optionally, add query parameters to filter or sort the results.
5. Click **Send**.

### 3. Handling Query Parameters for Sorting and Filtering
You can combine various query parameters to filter or sort the results based on different fields. For example:
```bash
GET /get-tours?page=1&adult_price=asc&destination=mustang
```

This will retrieve the tours on page 1, sorted by `adult_price` in ascending order, and filtered by the destination "Mustang."

---

## Notes
- The query parameters `adult_price`, `youth_price`, and `popularity` control the sorting of the results.
- Filtering is available for a variety of fields like `destination`, `category`, `tour_type`, and more.
- Pagination is implemented through the `page` query parameter. Each page returns up to 10 tours.


### Role-Based Access Control
| Role | Permissions |
|------|------------|
| **Admin** | Manage users and tours, create/update/remove admins, reset passwords, access all routes |
| **User** | Book tours, update personal details, view available tours |

## How to Use
### 1. Authentication
- **Login** with a valid email and password.
- **JWT Token** is stored as a cookie for authentication.
- **Logout** clears the authentication token.

### 2. Managing Users
- **Get all users** (admin only).
- **Register new users** (open to all).
- **Update own details** (requires authentication).
- **Remove users** (admin only).

### 3. Managing Tours
- **Create, update, delete tours** (admin only).
- **View available tours** (open to all users).
- **Book tours** (authenticated users only).

### 4. Password Reset
- **Forgot Password** sends a reset link to the email.
- **Reset Password** updates the password using the provided token.

## Security Considerations
- Passwords are securely hashed using bcrypt.
- Secure routes with middleware authentication.


---

### Security

This application includes several security features:

1. **Rate Limiting**: The app is protected against brute-force attacks using rate limiting middleware. This limits the number of requests a user can make in a given time frame.

2. **Helmet**: Helmet.js is used to set various HTTP headers to secure the app against common vulnerabilities.

3. **CORS**: Cross-Origin Resource Sharing (CORS) is configured to restrict requests only to specific origins. The allowed origins are defined in the environment variables.

4. **Prevent HTTP Parameter Pollution (HPP)**: A custom middleware is implemented to protect against HTTP parameter pollution.

---

### Error Handling

The app uses a custom error handling middleware to catch and respond to errors. The `errorController` handles different error scenarios, such as invalid routes or server errors, and sends appropriate responses.

---

### Environment Variables

To run the application properly, you will need the following environment variables:

- **MONGO_URI**: The URI of the MongoDB database.
- **PORT**: The port number for the app to run (default: 6000).
- **URL**: The base URL of the app (used in CORS configuration).
- **personal_message_gmail**: Email address for sending booking and enquiry messages.
- **SECRET_KEY**: Secret key used for JWT authentication.

---

### Features
- **Role-Based Authentication**: Admins and users have different levels of access.
- **Password Management**: Users and admins can reset passwords via email verification.
- **CRUD Operations**: Admins can manage users and tours.
- **Secure Routes**: Authentication middleware ensures only authorized users can perform actions.

### Technologies Used
- **Node.js** & **Express.js** for backend development
- **MongoDB** with Mongoose for database operations
- **JWT (jsonwebtoken)** for authentication
- **Bcrypt.js** for password hashing
- **dotenv** for environment variables
- **crypto** for secure token generation


