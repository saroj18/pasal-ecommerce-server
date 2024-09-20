# 🖥️ Pasal eCommerce Platform - Backend

This repository contains the backend codebase for the Pasal multi-vendor eCommerce platform. The backend is built using Node.js, Express, and MongoDB, providing a robust and scalable API for managing vendors, products, orders, payments, and more. It features a secure and efficient implementation of multi-vendor functionality, enabling seamless communication between the frontend and the server.

## ✨ Features

- **Vendor Management:** 🛒 API endpoints for vendors to manage their stores, products, and orders.
- **Product Management:** 📦 RESTful APIs for creating, updating, deleting, and querying products.
- **Order Management:** 📑 Secure and efficient order processing, including order creation, tracking, and status updates.
- **User Authentication:** 👤 JWT and OAuth-based authentication for secure access to vendor and customer accounts.
- **Email Notifications:** ✉️ Automated email notifications for order confirmations, status updates, and promotional messages.
- **Payment Integration:** 💳 Integrated with E-sewa and Khalti for secure and reliable payment processing.
- **Real-Time Updates:** 🔔 WebSockets support for real-time notifications and live chat functionality.
- **Analytics & Reports:** 📊 APIs for generating sales and traffic analytics, with data aggregation and filtering.
- **Security:** 🔒 Comprehensive security measures including data validation, user authentication, and secure payment handling.

## 🛠️ Tech Stack

- **Framework:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT, OAuth
- **Payment Integration:** E-sewa, Khalti
- **Real-Time Communication:** WebSockets
- **Email Service:** NodeMailer
- **Hosting:** Render

## 📂 Client Repository

📂 [Pasal eCommerce Client](https://github.com/saroj018/pasal-ecommerce-client)

## 🖥️ Admin Panel & Client

This backend serves the [Pasal eCommerce Platform frontend](https://pasal-ecommerce-client.vercel.app/) and the admin dashboard, providing a seamless experience for both vendors and customers.

## 🧰 Folder Structure

- **/controllers**: Business logic for handling various routes.
- **/models**: MongoDB models and schemas.
- **/routes**: API route definitions.
- **/middlewares**: Custom middleware for authentication and validation.
- **/utils**: Utility functions and helpers.

## 🚀 Getting Started

To set up the backend locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/saroj018/pasal-ecommerce-server.git
    ```
2. **Install the dependencies**:
    ```bash
    npm install
    ```
3. **Set up environment variables**:
    - Create a `.env` file in the root directory.
    - Add necessary environment variables like database connection strings, JWT secret, and API keys.
4. **Run the server**:
    ```bash
    npm run dev
    ```





