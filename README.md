# Tasque Manager/Task Manager - Fullstack (Spring Boot API + React SPA)

Tasque Manager is a fullstack task management application built as a **production‑oriented MVP**.

The project follows a clean, layered architecture and deliberately separates backend and frontend to reflect real‑world production practices.

---

## Architecture Overview

The application consists of two independent parts:

* **Backend** - standalone Spring Boot REST API
* **Frontend** - standalone React SPA communicating with the backend over HTTP

```
PostgreSQL  →  Spring Boot (REST API)  →  React SPA (Vite / Browser)
```

The frontend is **not embedded** into the backend by default and can be deployed separately (e.g. Nginx, CDN, Vercel). This design enables independent development, deployment, and scaling of each layer.

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
* Filtering, pagination, and sorting
* PostgreSQL persistence
* Database schema versioning with Flyway
* Optimistic locking (`@Version`)
* Clean layered architecture: **Controller → Service → Repository**
* Global exception handling
* Ready for Docker‑based deployment

---

## Repository Structure

```
/
├── pom.xml                    # Backend build configuration
├── Dockerfile                 # Spring Boot backend image
├── docker-compose.yml         # PostgreSQL (backend optional)
├── frontend/                  # React (Vite) frontend
├── src/main/java              # Spring Boot source code
├── src/main/resources
│   └── db/migration           # Flyway SQL migrations
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

### Start PostgreSQL

Using Docker:

docker-compose up -d db

Or run PostgreSQL manually and update `application.yml` accordingly.

---

### Run Backend (Spring Boot API)

mvn clean package
java -jar target/tasque-manager-0.0.1-SNAPSHOT.jar

Backend will be available at:

* [http://localhost:8080](http://localhost:8080)
* API base URL: [http://localhost:8080/api](http://localhost:8080/api)

---

### Run Frontend (React SPA)

For development with hot reload:

cd frontend
npm install
npm run dev

Frontend dev server:

* [http://localhost:5173](http://localhost:5173)

The frontend communicates with the backend via REST API and can be configured to proxy requests during development.

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

## Docker (Production‑like Setup)

This setup runs **PostgreSQL + backend**. The frontend is expected to be deployed separately.

mvn clean package -DskipTests

docker build -t tasque-manager-backend .

docker-compose up -d


---

## Design Notes

* Backend and frontend are intentionally decoupled
* Backend is designed as a reusable API for multiple clients
* Frontend can be replaced or extended without backend changes
* Focus on correctness, structure, and maintainability rather than feature bloat

---

## Project Status

This project represents a **functional MVP**.

Planned improvements (out of scope for the current version):

* Authentication & authorization
* Automated tests
* OpenAPI / Swagger documentation
* CI/CD pipeline

---

## License

MIT
