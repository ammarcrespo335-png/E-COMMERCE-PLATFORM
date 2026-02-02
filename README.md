# E-Commerce Platform Backend

A scalable and modular **E-Commerce Backend API** built with **NestJS**, **TypeScript**, and **MongoDB (Mongoose)**. The project is designed with clean architecture principles, focusing on separation of concerns, scalability, and maintainability.

---

## 🚀 Overview

This project provides a complete backend solution for an e-commerce platform, including authentication, product management, orders, payments, and more. It is structured in a way that makes it easy to extend, test, and maintain, making it suitable for real-world applications.

---

## ✨ Features

* JWT Authentication & Authorization
* Role-Based Access Control (Admin / User / Super Admin)
* User Authentication & OTP Verification
* Product & Category Management
* Cart & Favorites System
* Order Management & Order Lifecycle
* Coupon & Discount System
* Payment Module (Stripe-ready)
* Modular & Scalable Architecture

---

## 🏗️ Folder Structure

```
src/
├── common/                # Shared utilities, guards, pipes, interceptors
├── DB/                    # Database layer (schemas & repositories)
│   ├── models/            # Mongoose schemas & enums
│   └── repository/        # Repository pattern for DB access
├── modules/               # Application modules (feature-based)
│   ├── auth/              # Authentication & authorization
│   ├── cart/              # Shopping cart logic
│   ├── category/          # Product categories
│   ├── coupon/            # Coupons & discounts
│   ├── favorites/         # User favorites
│   ├── orders/            # Orders & order management
│   ├── payment/           # Payment handling
│   ├── products/          # Products management
│   └── shop/              # Shop & storefront logic
├── shared.module.ts       # Shared providers & modules
├── app.controller.ts      # Root controller
├── app.module.ts          # Root application module
├── app.service.ts         # Root service
├── main.ts                # Application entry point
```

---

## 🧠 Architecture & Design Principles

### Modular Architecture

* Each feature is isolated in its own module
* Improves scalability and maintainability
* Easy to add or remove features without affecting others

### Repository Pattern

* Database logic is abstracted from business logic
* Improves testability
* Allows easier database replacement in the future

### Separation of Concerns

* Controllers handle HTTP requests
* Services handle business logic
* Repositories handle database operations

---

## 🔐 Security

* JWT-based authentication
* Role-based authorization using Guards
* OTP system for email verification and password reset
* Password hashing
* Environment variables for sensitive data

---

## ⚡ Scalability & Performance

* Clean and extensible project structure
* MongoDB schemas designed for indexing
* Pagination-ready endpoints
* Payment system designed for multiple providers
* Ready for caching and background jobs integration

---

## 🧪 Testing (Planned)

* Unit testing with Jest
* Service & repository level tests
* Integration testing for critical flows

---

## 🐳 Deployment (Planned)

* Docker & Docker Compose support
* Environment-based configuration
* Production-ready build process

---

## 📦 Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
SUCCESS_URL=payment_success_url
CANCEL_URL=payment_cancel_url
```

---

## ▶️ Getting Started

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run start:dev
```

### Build for Production

```bash
npm run build
npm run start:prod
```

---

## 📈 Future Improvements

* Add Redis caching
* Background jobs & queues
* Advanced logging (Winston / Pino)
* CI/CD pipeline (GitHub Actions)
* Full test coverage

---

## 👨‍💻 Author

**Ammar Crespo**
Backend Developer — Node.js / NestJS

---

## 📄 License

This project is licensed under the MIT License.
