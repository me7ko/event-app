# Event Management Application

This is a full-stack event management application built with:
- **Backend**: Node.js, Express, PostgreSQL, Knex.js
- **Frontend**: Next.js, React, Tailwind CSS

It supports user authentication (JWT), role-based access control (admin vs user), and CRUD operations for events.

---

## 🚀 Features
- Register and login users
- JWT-based authentication
- Role-based access (admin can manage all events, users can manage their own)
- CRUD for events
- Protected routes
- Frontend with login/register pages, event list, event detail, create/update forms
- Navbar updates automatically on login/logout
- Admin can view, edit, and delete all events

---

## ⚙️ Setup Instructions

### 1. Clone the repository

### 2. Backend Setup
```bash
cd backend
npm install
```

## 2.1. Create .env in backend folder
- PORT=5000
- JWT_SECRET=your_secret_key
- DB_USER=your_postgres_user
- DB_PASSWORD=your_postgres_password
- DB_HOST=localhost
- DB_PORT=your_db_port
- DB_NAME=eventapp

## 2.2. Create PostgreSQL database
```sql
CREATE DATABASE eventapp;
```

## 2.3. Setup the database

Run migrations to create the database schema:
```bash
npx knex migrate:latest
```

## 2.4. Start the backend
```bash
npm run dev
```
### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
## 3.1. Create .env in frontend folder
- JWT_SECRET=your_secret_key

## 3.2. Start the frontend
```bash
npm run dev
```
### 📝 Notes
- Use npm run dev for development (both backend and frontend).
- Use migrate:latest whenever you update database schema.
- Environment files (.env) are not pushed to GitHub. Instead, .env.example provides the required structure.

## How to add admin role
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```
