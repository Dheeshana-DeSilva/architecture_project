# Book Fair System

A comprehensive full-stack application designed to manage book fair stalls, reservations, user interactions, and admin tasks.

## 🏗️ Architecture Overview

The project is structured into three main directories:
- **`frontend/`**: A modern single-page web application built with React, Vite, and Tailwind CSS.
- **`backend/`**: A robust REST API built with Java 17 and Spring Boot, handling business logic, authentication, and data access.
- **`database/`**: SQL scripts for PostgreSQL schema creation and initial data seeding.

## ✨ Key Features
- **User Authentication**: Secure OIDC login via Auth0 and local JWT implementation.
- **Role-based Access Control**: Distinct features for `ADMIN`, `EMPLOYEE`, and `VENDOR` roles.
- **Stall Reservation System**: Interactive floor plans allowing vendors to view and reserve stalls.
- **QR Code Integration**: Generation and scanning of QR codes for verifying reservations.
- **Security Posture**: Fully mitigated against OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR).

---

## ⚙️ Configuration & Secrets Management
**IMPORTANT**: All sensitive credentials have been removed from this repository for security purposes. Before running the application, you must configure the following files:

### 1. Backend Configuration
Navigate to `backend/src/main/resources/application.properties` and replace the placeholder values:
- `spring.datasource.password`: Your local PostgreSQL password.
- `spring.mail.username` & `spring.mail.password`: Your Gmail address and Google App Password for sending booking emails.
- `app.jwtSecret`: A long, secure random string for signing local JWTs.
- `YOUR_AUTH0_DOMAIN`: Replace with your Auth0 tenant domain (e.g., `dev-xxxx.us.auth0.com`).

### 2. Frontend Configuration
Navigate to `frontend/src/services/auth0.config.js` and replace the placeholder values:
- `domain`: Your Auth0 tenant domain.
- `clientId`: Your Auth0 Client ID.

---

## 🚀 Deployment & Running Locally

### Prerequisites
- Node.js (v18+)
- Java 17 & Maven
- PostgreSQL

### Step 1: Database Setup
1. Open pgAdmin or your PostgreSQL CLI.
2. Create a database named `bookfair_db`.
3. Run the scripts found in `database/schema.sql` and `database/seed.sql` to initialize tables and default accounts.

### Step 2: Running the Backend
1. Open a terminal and navigate to the `backend` directory.
2. Run the application using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The server will start on `http://localhost:8080`.

### Step 3: Running the Frontend (Development)
1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:5173`.

### Step 4: Building Frontend for Production Deployment
To generate static production files for the frontend (to be hosted on Vercel, Netlify, or an Nginx server):
```bash
npm run build
```
The optimized files will be output to the `frontend/dist/` directory.
