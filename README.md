# Tasque Manager — Fullstack (Spring Boot + React)

Tasque Manager is a fullstack task management application built as a single repository
with a Spring Boot backend and a React frontend.

The project is designed as a production-oriented MVP with a clean architecture,
database migrations, and a modern frontend toolchain.

---

## Tech Stack

### Backend

* Java 17
* Spring Boot
* Spring Web
* Spring Data JPA
* Flyway
* PostgreSQL
* Maven

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* DaisyUI

---

## Features

* REST API for task management (CRUD)
* PostgreSQL persistence
* Database schema versioning with Flyway
* React SPA frontend
* Monorepo structure (backend + frontend)
* Prepared for Docker-based deployment

---

## Repository Structure

```
/
├── pom.xml                         # Backend build configuration
├── Dockerfile                      # Spring Boot application image
├── docker-compose.yml              # PostgreSQL + app (optional)
├── frontend/                       # React (Vite) frontend
├── src/main/java                   # Spring Boot source code
├── src/main/resources
│   └── db/migration                # Flyway SQL migrations
└── README.md
```

---

## Database Migrations

Flyway migrations are located in:

```
src/main/resources/db/migration
```

Current migrations:

* `V1__create_tasks_table.sql`
* `V2__create_task_status_enum.sql`
* `V3__create_task_priority_enum.sql`

---

## Running the Application (Development)

### 1. Start PostgreSQL

You can use Docker:

docker-compose up -d db

Or run PostgreSQL manually and update `application.yml`.

---

### 2. Build and Run Backend

mvn clean package
java -jar target/tasque-manager-0.0.1-SNAPSHOT.jar

Backend will be available at:
http://localhost:8080

API base URL:
http://localhost:8080/api

---

## Frontend Development (Optional)

For faster frontend iteration, you can run the frontend separately.
cd frontend
npm install
npm run dev

Frontend dev server:
http://localhost:5173

The frontend can be configured to proxy API requests to the backend.

---

## Configuration

### Backend

Database configuration is defined in `application.yml`:

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tasque
    username: tasque_user
    password: secret

For production, environment variables should be used instead.

---

## Docker (Production-like Setup)

mvn clean package -DskipTests
docker build -t tasque-manager .
docker-compose up -

This setup runs:
- PostgreSQL
- Spring Boot backend

Frontend is not bundled into the backend container
and can be deployed separately.


---

## Project Status

This project represents a functional MVP.
Further improvements (security, tests, CI/CD, deployment optimizations)
are planned but intentionally kept out of the initial version.

---

## License

MIT
