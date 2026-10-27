# Project Management System — Backend API

A production-grade modular monolith REST API built with **NestJS**, **PostgreSQL**, **Prisma ORM**, and **JWT Authentication** following **Pragmatic Clean Architecture** and **Domain-Driven Design (DDD)** principles.

---

## 🏛️ Architectural Overview

```
                      ┌────────────────────────────────────────┐
                      │    Postman / Web App / Android Client  │
                      └──────────────────┬─────────────────────┘
                                         │ Bearer JWT / JSON
                                         ▼
                      ┌────────────────────────────────────────┐
                      │      NestJS HTTP Presentation Layer    │
                      │  Global Pipes, Throttler, Auth Guards  │
                      └──────────────────┬─────────────────────┘
                                         │
        ┌───────────────────┬────────────┴───────┬────────────────────┐
        ▼                   ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌────────────────┐   ┌─────────────────┐
│  Auth Module  │   │Projects Module│   │  Tasks Module  │   │Dashboard Module │
│ Register/Login│   │Ownership Scope│   │ Task Lifecycle │   │ SQL Aggregation │
└───────┬───────┘   └───────┬───────┘   └────────┬───────┘   └────────┬────────┘
        │                   │                    │                    │
        ▼                   ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Application & Domain Layer                            │
│           Use Cases, Domain Rules, Entities, Repository Interfaces           │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Infrastructure Layer                                  │
│                 Prisma Client / PostgreSQL Relational DB                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Why These Decisions?

| Decision | Engineering Justification |
| :--- | :--- |
| **NestJS (Modular Monolith)** | Strong dependency injection, clear boundaries between domain contexts, decoupled controllers and services. |
| **PostgreSQL** | Strict relational integrity with foreign keys, unique email constraints, custom date check constraints, and indexed queries. |
| **Prisma ORM** | Type-safe query building, versioned migrations, and parameterized SQL queries preventing SQL injection. |
| **Argon2id Hashing** | OWASP-recommended memory-hard hashing algorithm resistant to GPU/ASIC brute-force attacks. |
| **Active Session Revocation** | Sessions are tracked in a persistent table with hashed refresh tokens. Revoking on logout invalidates the token immediately. |
| **Strict Ownership Isolation** | Every project and task query resolves through `ownerId` derived from the validated JWT token—never from client request parameters. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **Docker Desktop**: Running locally
- **Postman**: For API verification

### 2. Environment Configuration
The `.env` file is already pre-configured for local Docker development:
```dotenv
PORT=3000
DATABASE_URL=postgresql://app_user:local_password@localhost:5432/project_management?schema=public
JWT_ACCESS_SECRET=super_secret_access_jwt_key_project_management_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_project_management_2026
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=project-management-api
JWT_AUDIENCE=project-management-clients
WEB_ORIGIN=http://localhost:5173
```

### 3. Start Database (Docker)
```bash
docker compose up -d
```

### 4. Run Migrations and Seed Test Users
```bash
npx prisma migrate dev
npx prisma db seed
```

Pre-seeded accounts:
- **User A**: `usera@example.test` / `TestPassword!2026`
- **User B**: `userb@example.test` / `TestPassword!2026`

### 5. Start NestJS Backend
```bash
# Production build & run:
npm run build
node dist/main.js

# Or Dev mode with watch:
npm run start:dev
```
The server will listen at: `http://localhost:3000/api/v1`

---

## 📡 REST API Methods Explained

| Method | Idempotent? | Safe? | Purpose in This Project | Example Endpoint |
| :--- | :---: | :---: | :--- | :--- |
| **POST** | ❌ No | ❌ No | Creates new resources (users, sessions, projects, tasks). | `POST /api/v1/projects` |
| **GET** | ✅ Yes | ✅ Yes | Reads records with bounded pagination and filters. No side effects. | `GET /api/v1/projects?status=IN_PROGRESS` |
| **PUT** | ✅ Yes | ❌ No | Full replacement of editable fields for a project or task. | `PUT /api/v1/projects/:id` |
| **PATCH** | ⚠️ Partial | ❌ No | Updates specific fields without resending the entire entity (e.g. status). | `PATCH /api/v1/tasks/:id` |
| **DELETE** | ✅ Yes | ❌ No | Permanently deletes a resource owned by the user. | `DELETE /api/v1/tasks/:id` |

---

## 📮 Postman Testing Guide

Ready-to-import Postman files are located in the `postman/` directory:
1. `postman/project-management-api.postman_collection.json`
2. `postman/project-management-local.postman_environment.json`

### Import Instructions:
1. Open **Postman**.
2. Click **Import** (top left).
3. Select both JSON files from the `postman/` folder.
4. Select the environment **Project Management - Local** in the top-right environment dropdown.

### Step-by-Step Test Sequence:
1. **Health Check**: Run `GET /health` -> returns `{ status: "ok", database: "connected" }`.
2. **Login User A**: Run `POST /auth/login (User A)` -> Automatically captures `tokenA` and `userA` into environment variables!
3. **Login User B**: Run `POST /auth/login (User B)` -> Automatically captures `tokenB` and `userB`.
4. **Create Project**: Run `POST /projects` with `{{tokenA}}` -> Automatically sets `projectId`.
5. **Create Task**: Run `POST /tasks` with `{{tokenA}}` -> Automatically sets `taskId`.
6. **Complete Task**: Run `PATCH /tasks/{{taskId}}` with `{"status": "COMPLETED"}`.
7. **View Dashboard**: Run `GET /dashboard` with `{{tokenA}}` -> returns live database count aggregates.
8. **Run Two-User Security Isolation Tests**:
   - `User B reads Project A`: Returns `404 Not Found` (Resource hidden).
   - `User B modifies Task A`: Returns `404 Not Found`.
   - `User B deletes Project A`: Returns `404 Not Found`.
9. **Logout & Session Revocation**: Run `POST /auth/logout`. Then call `GET /auth/me` with the same token -> returns `401 Unauthorized` immediately.

---

## 🧪 Automated Testing
Run the automated TypeScript end-to-end test suite:
```bash
npx ts-node test/e2e-verify.ts
```
