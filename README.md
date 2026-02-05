# Tasque Manager/Task Manager - Fullstack (Spring Boot API + React SPA)

Tasque Manager is a fullstack task management application built as a production-oriented MVP.

The project follows a clean, layered architecture and deliberately separates backend and frontend to reflect real-world production practices.

---

## Architecture Overview

The application consists of two independent parts:

* **Backend** - standalone Spring Boot REST API
* **Frontend** - standalone React SPA communicating with the backend over HTTP

```
PostgreSQL -> Spring Boot (REST API) -> React SPA (Vite / Browser)
```

The frontend is not embedded into the backend by default and can be deployed separately (e.g. Nginx, CDN, Vercel). This design enables independent development, deployment, and scaling of each layer.

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
* Clean layered architecture: **Controller -> Service -> Repository**
* Global exception handling
* Authentication and authorization (JWT)
* OpenAPI / Swagger documentation
* Automated tests
* CI/CD pipeline
* Ready for Docker-based deployment

---

## Repository Structure

```
/
|-- backend/
|   |-- pom.xml                 # Backend build configuration
|   |-- src/main/java           # Spring Boot source code
|   |-- src/main/resources
|   |   `-- db/migration        # Flyway SQL migrations
|-- frontend/                   # React (Vite) frontend
|-- Dockerfile                  # Spring Boot backend image
|-- docker-compose.yml          # PostgreSQL (backend optional)
`-- README.md
```

---

## Database Migrations

Flyway migrations are located in:

```
backend/src/main/resources/db/migration
```

Current migrations:

* `V1__create_tasks.sql`
* `V2__add_indexes.sql`
* `V4__add_priority.sql`

Seed data (repeatable):

```
backend/src/main/resources/db/seed/R__seed_tasks.sql
```

---

## Running the Application (Development)

### Start PostgreSQL

Using Docker:

```
docker-compose up -d db
```

Or run PostgreSQL manually and update `application-postgres.yml` accordingly.

---

### Run Backend (Spring Boot API)

```
cd backend
mvn clean package
java -jar target/taskmanager-0.0.1-SNAPSHOT.jar
```

Backend will be available at:

* http://localhost:8080
* API base URL: http://localhost:8080/api

Swagger UI:

* http://localhost:8080/swagger-ui.html

---

### Run Frontend (React SPA)

For development with hot reload:

```
cd frontend
npm install
npm run dev
```

Frontend dev server:

* http://localhost:5173

The frontend communicates with the backend via REST API and can be configured to proxy requests during development.

---

## Configuration

### Backend

Database configuration is defined in `backend/src/main/resources/application-postgres.yml`:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
```

For production, environment variables should be used instead.

JWT settings are defined in `backend/src/main/resources/application.yml`:

```yaml
app:
  jwt:
    secret: "change-this-secret-in-prod-please-very-long"
    access-expiration-minutes: 30
    refresh-expiration-minutes: 43200
```

---

## Docker (Production-like Setup)

This setup runs PostgreSQL + backend. The frontend is expected to be deployed separately.

```
cd backend
mvn clean package -DskipTests
docker build -t tasque-manager-backend .
docker-compose up -d
```

---

## Design Notes

* Backend and frontend are intentionally decoupled
* Backend is designed as a reusable API for multiple clients
* Frontend can be replaced or extended without backend changes
* Focus on correctness, structure, and maintainability rather than feature bloat

---

## Project Status

This project represents a functional MVP with authentication, tests, OpenAPI docs, and CI/CD.

---

## License

MIT
