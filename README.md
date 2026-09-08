# CodeNova 🚀

**CodeNova** is a full-stack AI-powered coding and interview preparation platform designed to provide a complete environment for practicing programming problems, executing code, tracking progress, managing profiles, and preparing for technical interviews.

The project is being developed with a strong focus on **production-oriented software engineering**, including scalable backend architecture, secure authentication, PostgreSQL database design, Redis caching, API validation, automated testing, and cloud deployment.

---

## 🌐 Project Overview

CodeNova brings together coding practice, code execution, progress tracking, user management, and administrative functionality in one platform.

### Core platform flow

```text
                    CodeNova
                       │
             ┌─────────┴─────────┐
             │                   │
          Frontend             Backend
             │                   │
        React + Vite       Node.js + Express
             │                   │
             │          ┌────────┼────────┐
             │          │        │        │
             │        Auth     Problems  Submissions
             │          │        │        │
             │          └────────┼────────┘
             │                   │
             │          ┌────────┴────────┐
             │          │                 │
             │     PostgreSQL           Redis
             │          │
             │       Prisma 7
             │
             └────────────────────────────
                         │
                       Judge0
                         │
                  Code Execution
```

---

# ✨ Features

## 👤 Authentication & Users

* User registration and login
* JWT-based authentication
* Authentication using secure `httpOnly` cookies
* Password hashing with bcrypt
* Logout functionality
* Authenticated user verification
* Protected routes
* Role-based authorization
* Admin access control
* Redis-backed token blacklist

## 💻 Coding Platform

* Problems listing
* Problem details
* Search functionality
* Problem filtering
* Monaco code editor
* Multiple programming languages
* Run Code
* Submit Code
* Judge0-based code execution
* Compilation and runtime error handling
* Submission status tracking
* Solved problem tracking

## 📊 Dashboard & Progress

* User dashboard
* Problems solved tracking
* Submission activity
* Daily activity tracking
* Progress information
* Coding statistics
* User performance data

## 👤 Profile

* User profile
* Profile image upload
* Profile information
* Activity information
* Progress tracking

## ⚙️ Settings

* User settings
* Notification preferences
* Application preferences
* Reliable settings updates

## 🛠️ Admin

* Admin interface
* Problem management
* Problem creation
* Duplicate problem prevention
* Administrative authorization

## 📚 API & Backend

* REST API architecture
* Swagger/OpenAPI documentation
* Request validation
* Centralized error handling
* Security middleware
* Rate limiting
* Redis caching
* PostgreSQL persistence
* Database optimization

---

# 🧱 Technology Stack

## Frontend

| Technology      | Purpose                |
| --------------- | ---------------------- |
| React           | UI development         |
| Vite            | Frontend build tooling |
| Redux Toolkit   | State management       |
| React Router    | Client-side routing    |
| Tailwind CSS    | Styling                |
| DaisyUI         | UI components          |
| Monaco Editor   | Code editor            |
| Axios           | API communication      |
| React Hook Form | Form management        |
| Zod             | Validation             |

## Backend

| Technology      | Purpose                     |
| --------------- | --------------------------- |
| Node.js         | Runtime                     |
| Express.js      | Backend framework           |
| CommonJS        | Module system               |
| Prisma 7        | ORM                         |
| PostgreSQL      | Relational database         |
| Redis           | Cache / distributed state   |
| JWT             | Authentication              |
| bcrypt          | Password hashing            |
| Axios           | External API communication  |
| Helmet          | Security headers            |
| CORS            | Cross-origin access control |
| Swagger/OpenAPI | API documentation           |
| Jest            | Automated testing           |
| Supertest       | API testing                 |

## External Services

| Service            | Purpose                      |
| ------------------ | ---------------------------- |
| Judge0             | Remote code execution        |
| RapidAPI           | Judge0 API access            |
| Redis Cloud        | Managed Redis infrastructure |
| Managed PostgreSQL | Production database          |
| Vercel             | Frontend hosting             |
| Render             | Backend hosting              |

---

# 🏗️ Backend Architecture

The backend follows a modular architecture designed to keep authentication, problems, submissions, configuration, middleware, database access, and external integrations separated.

```text
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── docs/
│   ├── app.js
│   └── index.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── package.json
```

The application startup process is designed to:

```text
Load Environment
       ↓
Validate Configuration
       ↓
Initialize PostgreSQL
       ↓
Initialize Redis
       ↓
Start Express Server
       ↓
Accept Requests
```

---

# 🗄️ Database Architecture

CodeNova uses:

```text
PostgreSQL
    ↓
Prisma 7
    ↓
Application
```

The database layer uses relational concepts including:

* Primary keys
* Foreign keys
* UUIDs
* Relationships
* Constraints
* Transactions
* Upserts
* Database migrations
* Normalized relational data

The project previously used MongoDB/Mongoose and the database layer has been migrated toward PostgreSQL + Prisma.

```text
MongoDB + Mongoose
        ↓
PostgreSQL + Prisma 7
```

This migration involved schema redesign, relationship modeling, ORM changes, dependency cleanup, and preservation of application behavior.

---

# ⚡ Redis Architecture

Redis is integrated into the backend for fast-access and distributed state use cases.

Current uses include:

* Token blacklist
* Authentication-related state
* Application caching
* Rate limiting
* Temporary data
* Distributed state management

Conceptually:

```text
Application
    │
    ├── PostgreSQL → persistent data
    │
    └── Redis → cache / temporary / distributed state
```

Redis connectivity and failure handling are part of backend startup and runtime behavior.

---

# 🧑‍💻 Code Execution Architecture

CodeNova integrates Judge0 for executing submitted programs.

```text
User
 ↓
Frontend
 ↓
Submission API
 ↓
Judge0 / RapidAPI
 ↓
Code Execution
 ↓
Execution Result
 ↓
Backend
 ↓
Database
 ↓
Frontend
```

The platform handles execution-related outcomes such as:

* Successful execution
* Compilation errors
* Runtime errors
* Execution status
* Test-case results
* Submission tracking

A future evolution can introduce background workers and queues:

```text
Submission
    ↓
Job Queue
    ↓
Execution Worker
    ↓
Judge0
    ↓
Result
```

---

# 🔐 Security

Security is treated as a core part of the application architecture.

Current security measures include:

* JWT authentication
* `httpOnly` authentication cookies
* bcrypt password hashing
* Authentication middleware
* Role-based access control
* Admin authorization
* Request validation
* Redis-backed rate limiting
* Redis token blacklist
* CORS configuration
* Helmet security headers
* Environment-based secrets
* Centralized error handling

Secrets are intentionally kept outside source control.

> **Never commit `.env` files or API keys to the repository.**

---

# ✅ Testing & Quality

The backend includes an automated Jest/Supertest testing setup.

Testing focuses on areas such as:

* Authentication
* User APIs
* Problem APIs
* Submission APIs
* Validation
* Error handling
* Security behavior
* Regression prevention

Production quality will continue to expand toward:

```text
Unit Tests
    ↓
Integration Tests
    ↓
End-to-End Tests
    ↓
Performance Testing
    ↓
Security Testing
```

---

# 📖 API Documentation

CodeNova provides API documentation using Swagger/OpenAPI.

The API documentation is intended to provide:

* Available endpoints
* Request structures
* Response structures
* Authentication information
* API contract visibility

This makes backend APIs easier to test, understand, and maintain.

---

# ☁️ Production Hosting

CodeNova is currently entering its **production hosting phase**.

The planned deployment architecture is:

```text
                         GitHub
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
          Frontend                  Backend
           Vercel                    Render
              │                         │
              │             ┌───────────┼───────────┐
              │             │           │           │
              │       PostgreSQL      Redis       Judge0
              │             │           │           │
              └─────────────┴───────────┴───────────┘
```

### Current production target

**Frontend**

```text
Vercel
```

**Backend**

```text
Render Web Service
```

**Database**

```text
Managed PostgreSQL
```

**Redis**

```text
Redis Cloud
```

**Code Execution**

```text
Judge0 via RapidAPI
```

---

# 🚀 Production Readiness

The project is being prepared for deployment without unnecessarily changing the existing application architecture.

Production readiness includes verification of:

* Environment variables
* Production database configuration
* Prisma generation
* Prisma migrations
* Render port handling
* Server host binding
* CORS
* Cross-origin authentication
* Secure cookies
* Frontend API configuration
* Redis connectivity
* Judge0 connectivity
* Health checks
* Production builds
* Deployment configuration

Health endpoint:

```text
GET /health
```

Expected purpose:

```text
Verify that the backend service is running
and reachable by the deployment platform.
```

---

# 🔄 Current Deployment Workflow

The current deployment phase follows this sequence:

```text
Inspect Existing Application
        ↓
Verify Production Configuration
        ↓
Fix Deployment Blockers
        ↓
Deploy Backend → Render
        ↓
Verify Backend
        ↓
Deploy Frontend → Vercel
        ↓
Connect Frontend + Backend
        ↓
Verify Authentication Cookies
        ↓
Verify PostgreSQL
        ↓
Verify Redis
        ↓
Verify Judge0
        ↓
Run Full Production Test
```

Docker and CI/CD are intentionally **not part of the current deployment step**.

---

# 🧪 Production Verification Checklist

After deployment, the complete application should be tested end-to-end.

### Frontend

* [ ] Frontend loads
* [ ] Routing works
* [ ] Login page works
* [ ] Signup page works
* [ ] Problems page works
* [ ] Search works
* [ ] Filters work
* [ ] Coding page works
* [ ] Dashboard works
* [ ] Profile works
* [ ] Profile image works
* [ ] Settings work
* [ ] Admin UI works

### Backend

* [ ] Health endpoint works
* [ ] Registration works
* [ ] Login works
* [ ] Logout works
* [ ] Authenticated-user check works
* [ ] Problem listing works
* [ ] Problem details work
* [ ] Search/filter APIs work
* [ ] Run Code works
* [ ] Submit Code works
* [ ] Solved status updates correctly
* [ ] Dashboard APIs work
* [ ] Profile APIs work
* [ ] Settings APIs work
* [ ] Admin APIs work

### Infrastructure

* [ ] PostgreSQL connection works
* [ ] Prisma production migrations succeed
* [ ] Redis connection works
* [ ] Redis caching works
* [ ] Rate limiting works
* [ ] Judge0 integration works
* [ ] CORS works
* [ ] `httpOnly` authentication cookies work
* [ ] Production frontend/backend communication works

---

# 🐳 Docker — Future Phase

Docker is planned, but is intentionally **not yet part of the current deployment**.

Future development infrastructure may include:

```text
Docker Compose
│
├── Frontend
├── Backend
├── PostgreSQL
└── Redis
```

The future Docker phase will focus on:

* Dockerfiles
* Containerization
* Docker Compose
* Environment configuration
* Local infrastructure consistency
* Container-based deployment

---

# 🔄 CI/CD — Future Phase

After the first successful deployment, CI/CD can be introduced.

Planned pipeline:

```text
Git Push
   ↓
CI
   ↓
Lint
   ↓
Tests
   ↓
Build
   ↓
Deploy
   ↓
Health Check
   ↓
Production
```

Potential future capabilities include:

* Automated testing
* Automated builds
* Deployment automation
* Database migration pipelines
* Environment management
* Secret management
* Rollbacks
* Deployment health checks

---

# 📈 Scalability Roadmap

The current architecture is intentionally structured so that major workloads can be separated as CodeNova grows.

Potential future architecture:

```text
                    Load Balancer
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          API-1        API-2        API-3
             │            │            │
             └────────────┼────────────┘
                          │
                    PostgreSQL
                          │
                        Redis
                          │
                     Job Queue
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Worker-1      Worker-2      Worker-3
             │            │            │
             └────────────┼────────────┘
                          ▼
                    Code Execution
```

Relevant scalability concepts include:

* Horizontal scaling
* Load balancing
* Caching
* Queues
* Workers
* Asynchronous processing
* Connection pooling
* Rate limiting
* Backpressure
* Retry mechanisms
* Idempotency
* Fault tolerance

---

# 🤖 AI Roadmap

AI functionality is planned after the core platform becomes stable in production.

Potential AI capabilities include:

* LLM integration
* AI code analysis
* AI debugging
* AI code review
* Complexity analysis
* AI hints
* Problem explanations
* Personalized recommendations
* AI agents
* AI interviewer
* Skill-gap analysis
* Career recommendations
* Job matching

The AI architecture can eventually become a dedicated service:

```text
CodeNova Platform
       │
       ├── Coding
       ├── Dashboard
       ├── Profiles
       └── AI Services
              │
              ├── Code Analysis
              ├── Debugging
              ├── Interviewer
              └── Recommendations
```

---

# 🧠 Future Intelligence Layer

CodeNova can eventually use structured user activity such as:

```text
Problems Solved
Submissions
Attempts
Errors
Topics
Difficulty
Time Taken
Interview Performance
Projects
Skills
Career Goals
```

These signals can support:

* Skill profiles
* Personalized recommendations
* Learning paths
* Weak-topic detection
* Adaptive difficulty
* Interview readiness
* Career recommendations

---

# 🏢 Engineering Principles

CodeNova is being developed around the following principles:

### Scalability

Build components that can grow without requiring unnecessary rewrites.

### Reliability

Failures in one component should not unnecessarily bring down the entire system.

### Security

Credentials, user data, authentication tokens, submitted code, and infrastructure must be protected.

### Maintainability

Code should remain modular, understandable, testable, and easy to extend.

### Observability

Production systems should provide enough information to understand failures and system health.

### Backward Compatibility

Infrastructure and database changes should avoid unnecessary API-breaking changes.

### Incremental Development

```text
Build
 ↓
Validate
 ↓
Test
 ↓
Measure
 ↓
Improve
```

### Production First

The goal is not simply:

> **"Make it work."**

The goal is:

> **"Make it reliable, secure, maintainable, observable, scalable, and ready for real users."**

---

# 🛠️ Technology & Project Status

| Area                  | Technology / Feature  | Status              |
| --------------------- | --------------------- | ------------------- |
| Programming           | JavaScript            | ✅                   |
| Backend               | Node.js               | ✅                   |
| Backend               | Express.js            | ✅                   |
| Frontend              | React                 | ✅                   |
| Build Tool            | Vite                  | ✅                   |
| State Management      | Redux Toolkit         | ✅                   |
| Routing               | React Router          | ✅                   |
| Styling               | Tailwind CSS          | ✅                   |
| UI                    | DaisyUI               | ✅                   |
| Code Editor           | Monaco Editor         | ✅                   |
| API                   | REST APIs             | ✅                   |
| Authentication        | JWT                   | ✅                   |
| Password Security     | bcrypt                | ✅                   |
| Authorization         | RBAC                  | ✅                   |
| Database              | PostgreSQL            | ✅                   |
| ORM                   | Prisma 7              | ✅                   |
| Database Migration    | MongoDB → PostgreSQL  | ✅                   |
| Caching               | Redis                 | ✅                   |
| Rate Limiting         | Redis-backed          | ✅                   |
| Code Execution        | Judge0                | ✅                   |
| API Documentation     | Swagger/OpenAPI       | ✅                   |
| Request Validation    | Implemented           | ✅                   |
| Error Handling        | Centralized           | ✅                   |
| Security Hardening    | Implemented           | ✅                   |
| Database Optimization | Implemented           | ✅                   |
| Backend Testing       | Automated tests       | ✅                   |
| Git                   | Git/GitHub            | ✅                   |
| Production Hosting    | Vercel + Render       | 🔄 In Progress      |
| Production Database   | Managed PostgreSQL    | 🔄 Deployment Phase |
| Docker                | Containerization      | 🔜 Planned          |
| Docker Compose        | Local infrastructure  | 🔜 Planned          |
| CI/CD                 | Automated deployment  | 🔜 Planned          |
| Observability         | Metrics / tracing     | 🔜 Planned          |
| Monitoring            | Production monitoring | 🔜 Planned          |
| AI                    | LLM integration       | 🔮 Future           |
| AI                    | AI coding assistant   | 🔮 Future           |
| AI                    | AI interviewer        | 🔮 Future           |
| AI                    | Career intelligence   | 🔮 Future           |

### Status Legend

```text
✅ Implemented
🔄 In Progress
🔜 Planned
🔮 Future
```

---

# 📂 Repository Structure

```text
CodeNova/
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── generated/
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── req_docs/
│
├── .gitignore
└── README.md
```

---

# 🔗 Repository

GitHub:

**https://github.com/PriyanshuYadav000/CodeNova**

---

# 👨‍💻 Development Philosophy

CodeNova is more than a coding-platform project.

It is being developed as an opportunity to practice real-world engineering concepts across:

* Full-stack development
* Backend architecture
* Database engineering
* Distributed systems
* Security engineering
* API design
* Testing
* Cloud deployment
* DevOps
* Scalability
* AI engineering

The project follows an incremental engineering approach:

```text
Feature
  ↓
Architecture
  ↓
Implementation
  ↓
Validation
  ↓
Testing
  ↓
Production
  ↓
Scaling
  ↓
AI Intelligence
```

---

# 🚀 Roadmap

```text
✅ Core Full-Stack Platform
        ↓
✅ PostgreSQL + Prisma
        ↓
✅ Redis + Caching + Rate Limiting
        ↓
✅ Automated Backend Testing
        ↓
✅ Security Hardening
        ↓
🔄 Production Hosting
        ↓
🔜 Docker
        ↓
🔜 CI/CD
        ↓
🔜 Observability & Monitoring
        ↓
🔮 AI Services
        ↓
🔮 Intelligent Coding & Interview Platform
```

---

## License

This project is currently maintained as a personal software-engineering project.
