# 🏨 Tour Management System

A **Node.js-based Tour Management System** built with **Express.js**, **MongoDB**, and integrated with **email notifications**, **tour booking**, and **inquiry handling**. It includes **admin management**, **authentication via JWT**, **password reset**, and **secure cookie sessions**.

---

## 📁 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
   - [Admin Routes](#admin-routes)
   - [Tour Routes](#tour-routes)
   - [Booking & Enquiry Routes](#booking--enquiry-routes)
7. [Authentication Flow](#authentication-flow)
8. [Password Reset Flow](#password-reset-flow)
9. [Database Schema (Mongoose Models)](#database-schema-mongoose-models)
10. [Usage](#usage)
11. [Error Handling](#error-handling)
12. [Contributing](#contributing)
13. [License](#license)

---

## 🔍 Overview

This system allows **admins to manage tours**, including creating, updating, and deleting tour listings. Users can **browse tours**, **book them**, or **send inquiries**. Admins must be authenticated using **JWT tokens stored in cookies** for secure access.

---

## ✅ Features

- **Admin Authentication**: Login, logout, JWT token validation.
- **Admin Management**: Create, update, delete, and view admin users.
- **Tour Management**: CRUD operations for tours with filtering, sorting, pagination.
- **Tour Booking**: Customers can book a tour and receive confirmation emails.
- **Inquiry System**: Users can send questions directly to the admin email.
- **Password Reset**: Forgot password flow with email and token verification.
- **Email Notifications**: Nodemailer integration for sending booking confirmations and password reset links.

---

## ⚙️ Technologies Used

| Technology        | Description                          |
|-------------------|--------------------------------------|
| Node.js           | JavaScript runtime                   |
| Express.js        | Web framework                        |
| MongoDB / Mongoose| Database and ODM                     |
| JWT               | Token-based authentication           |
| BcryptJS          | Password hashing                     |
| Nodemailer        | Email sending                        |
| Crypto            | Secure token generation              |
| Multer (optional) | File upload middleware (commented out) |

---

## 🛠️ Installation

### 1. Clone the repository:

```bash
git clone https://github.com/your-repo/tour-management-system.git
cd tour-management-system
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Set up environment variables:

Create a `.env` file in the root directory with the following content:

```env
SECRETKEY=your_jwt_secret_key
jwtExpires=1h
URL=http://localhost:6000
personal_message_gmail=admin@example.com
personal_message_password=email_app_password
```

> Replace `email_app_password` with your actual Gmail app password if you're using Gmail SMTP.

### 4. Start the server:

```bash
npm start
```

The server will run on `http://localhost:6000`.

---

## 🌐 API Endpoints

### 🔐 Admin Routes

| Method | Endpoint                 | Description                         |
|--------|--------------------------|-------------------------------------|
| POST   | `/admin/create-admin`    | Register new admin                  |
| GET    | `/admin/get-admins`      | Get all admins                      |
| POST   | `/admin/login-admin`     | Admin login                         |
| DELETE | `/admin/logout-admin`    | Admin logout                        |
| PATCH  | `/admin/update-admin`    | Update current admin                |
| DELETE | `/admin/remove-admin/:id`| Delete an admin by ID               |
| POST   | `/admin/forget-password` | Request password reset              |
| PATCH  | `/admin/reset-password/:code` | Reset password via code       |

---

### 🗺️ Tour Routes

| Method | Endpoint                    | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/get-tours`                | Get all tours with filters               |
| GET    | `/get-tour/:slug`           | Get details of one tour by slug          |
| POST   | `/tour-admin/post-tour`     | Add a new tour (protected)               |
| PATCH  | `/tour-admin/update-tour/:id` | Update a tour by ID (protected)        |
| DELETE | `/tour-admin/delete-tour/:id` | Delete a tour by ID (protected)        |

---

### 📝 Booking & Enquiry Routes

| Method | Endpoint         | Description                       |
|--------|------------------|-----------------------------------|
| POST   | `/book-tour`     | Submit a tour booking request     |
| POST   | `/enquiry`       | Send an enquiry message to admin  |

---

## 🔐 Authentication Flow

- Admins must log in via `/admin/login-admin` to get a JWT token.
- The token is stored in an HTTP-only cookie (`auth_token`).
- Protected routes use the `checkJwt` middleware to verify the token.
- Logout clears the cookie.

---

## 🔁 Password Reset Flow

1. Admin requests password reset at `/admin/forget-password`.
2. A unique token is generated and stored in the database.
3. A reset link is sent to the admin’s email.
4. User clicks the link and is redirected to a frontend form.
5. Password is updated via `/admin/reset-password/:code`.

---

## 🗃️ Database Schema (Mongoose Models)

### 🧑‍💼 Admin Model

```js
{
  name: String,
  email: { type: String, unique: true },
  password: String,
  code: String, // For password reset
  resetExpiry: Date,
}
```

### 🗼 Tour Model

```js
{
  name: String,
  adult_price: Number,
  youth_price: Number,
  description: String,
  destination: String,
  category: String,
  tour_type: String,
  duration: String,
  discount: Number,
  placeName: String,
  active_month: String,
  popularity: Number,
  minimumGuest: Number,
  country: String,
  district: String,
  pickup_destination: String,
  drop_destination: String,
  // image: [String] (commented out for now)
}
```

---

## 🧪 Example Requests

### 🧾 Register Admin

```json
POST /admin/create-admin
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 🔐 Login Admin

```json
POST /admin/login-admin
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 📞 Book Tour

```json
GET /book-tour?tourName=Everest+Trek
POST Body:
{
  "firstName": "Alice",
  "lastName": "Smith",
  "phone": "9841234567",
  "email": "alice@example.com",
  "date": "2025-04-10",
  "time": "10:00 AM",
  "age": "30"
}
```

---

## 🛡️ Error Handling

All errors are passed through `next()` and handled by a centralized error middleware. Errors return structured JSON like:

```json
{
  "status": "error",
  "message": "Invalid email or password."
}
```

Common error codes:
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Internal server error

---



