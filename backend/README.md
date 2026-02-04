# Task Manager (Spring Boot)

## Run with H2 (default)

```bash
cd backend
mvn spring-boot:run
```

H2 console: `http://localhost:8080/h2`

## Run with PostgreSQL

1. Create database `taskdb` in PostgreSQL.
2. Update credentials in `src/main/resources/application-postgres.yml`.
3. Run:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## Flyway migrations

Migrations live in `src/main/resources/db/migration`.
On startup, Flyway runs them and Hibernate validates the schema.

Current migrations:
- `V1__create_tasks.sql`
- `V2__add_indexes.sql`
- `V4__add_priority.sql`

Seed data (repeatable):
- `db/seed/R__seed_tasks.sql`

Production profile (no seed data):
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## Build single JAR with React inside

This profile builds the React app and copies it into the Spring Boot JAR.

```bash
cd backend
mvn -Pfrontend -DskipTests package
```

Run the JAR:

```bash
java -jar target/taskmanager-0.0.1-SNAPSHOT.jar
```

## REST endpoints

- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

Query params for `GET /api/tasks`:
- `status`: `TODO | IN_PROGRESS | DONE`
- `priority`: `LOW | MEDIUM | HIGH`
- `sortBy`: `createdAt | dueDate | priority | status | title`
- `direction`: `asc | desc`

## Authentication & Authorization (JWT)

1) Get tokens:

`POST /api/auth/login`

```json
{
  "username": "admin",
  "password": "admin"
}
```

Response:

```json
{ "accessToken": "...", "refreshToken": "..." }
```

2) Use token:

`Authorization: Bearer <accessToken>`

3) Refresh token:

`POST /api/auth/refresh`

```json
{
  "refreshToken": "..."
}
```

Rules:

- `GET /api/tasks/**` -> USER or ADMIN
- `POST/PUT/DELETE /api/**` -> ADMIN only

## OpenAPI / Swagger

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Docker

Build and run with PostgreSQL:

```bash
docker compose up --build
```

App: `http://localhost:8080`  
Swagger: `http://localhost:8080/swagger-ui.html`

## Deploy to Railway

1) Push repo to GitHub.
2) Create a Railway project from the GitHub repo.
3) Add PostgreSQL in Railway.
4) Set variables in Railway:

- `SPRING_PROFILES_ACTIVE=postgres`
- `SPRING_DATASOURCE_URL` (Railway Postgres URL)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET` (long random string)

5) (Optional) CI deploy via GitHub Actions:

- Add GitHub secrets:
  - `RAILWAY_TOKEN`
  - `RAILWAY_PROJECT_ID`
  - `RAILWAY_SERVICE_ID`

Workflow file: `.github/workflows/railway-deploy.yml`

Example JSON body:

```json
{
  "title": "Finish report",
  "description": "Prepare Q4 report",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2026-02-10"
}
```
