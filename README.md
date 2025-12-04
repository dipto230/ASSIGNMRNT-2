# 🚗 Vehicle Rental System

**Live URL:** [https://assignment-2-ten-pi.vercel.app/](https://assignment-2-ten-pi.vercel.app/)

---

## 📌 Overview

The **Vehicle Rental System** is a backend API service built using **Node.js**, **Express.js**, **TypeScript**, and **PostgreSQL**. It enables user authentication, vehicle management, and booking operations with a fully functional REST API.

This project follows clean architecture patterns and includes production-ready security features such as hashed passwords and JWT-based authentication.

---

## ⭐ Features

### 👤 **Authentication & Authorization**

* User signup & signin
* JWT token-based authentication
* Role-based access control (Admin & Customer)

### 🚘 **Vehicle Management** (Admin Only)

* Add new vehicles
* Update vehicle details
* Delete vehicles
* View all vehicles / specific vehicle

### 📅 **Booking System**

* Customers can create bookings
* Admin & Customer can cancel bookings
* Admin can mark vehicle return
* Automatic availability update after return

### 📊 **Database Management**

* Tables for users, vehicles, and bookings
* Validations and constraints for data integrity

---

## 🛠️ Technology Stack

### **Backend**

* Node.js
* Express.js
* TypeScript

### **Database**

* PostgreSQL (via `pg` client)

### **Security & Utilities**

* bcrypt — secure password hashing
* jsonwebtoken — JWT access tokens
* dotenv — environment variable management

---

## ⚙️ Setup Instructions

### 1️⃣ **Clone the Repository**

```bash
 git clone <your-repo-url>
 cd <project-folder>
```

### 2️⃣ **Install Dependencies**

```bash
 npm install
```

### 3️⃣ **Environment Variables**

Create a `.env` file in the root folder:

```env
PORT=5000
CONNECTION_STR=your_postgresql_connection_string
JWT_SECRET=your_secret_key
```

### 4️⃣ **Initialize Database Tables**

Your app automatically runs `initDB()` on server start—ensure your DB is running.

---

## ▶️ Running the Project

### **Development mode**

```bash
npm run dev
```

### **Build TypeScript**

```bash
npm run build
```

### **Run Production**

```bash
npm start
```

---

## 📩 API Usage

Use Postman or any REST client.

### Authentication Endpoints

* `POST /api/v1/auth/signup`
* `POST /api/v1/auth/signin`

### Vehicles

* `POST /api/v1/vehicles` (Admin)
* `GET /api/v1/vehicles`
* `GET /api/v1/vehicles/:vehicleId`
* `PUT /api/v1/vehicles/:vehicleId` (Admin)
* `DELETE /api/v1/vehicles/:vehicleId` (Admin)

### Bookings

* `POST /api/v1/bookings`
* `GET /api/v1/bookings`
* `PUT /api/v1/bookings/cancel/:bookingId`
* `PUT /api/v1/bookings/return/:bookingId` (Admin)

---

## 🚀 Deployment

This project is deployed on **Vercel**.

Live URL: [https://assignment-2-ten-pi.vercel.app/](https://assignment-2-ten-pi.vercel.app/)

---

## © License

This project is for educational and assignment purposes.
