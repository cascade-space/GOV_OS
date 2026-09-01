# GovOS — Multi-Tenant Civic Governance Operating System

> **Prajna Labs × Cascade Technologies Solutions**
> A browser-based Web OS for unified, real-time civic governance across municipalities, panchayats, and urban local bodies.

---

## What Is GovOS?

GovOS is not a web application. It is a **Civic Governance Operating System** — a browser-based OS shell that gives elected representatives, government officers, and citizens a unified, real-time intelligence layer over the entire lifecycle of urban and rural governance.

A single deployment serves hundreds of independent government bodies with **complete data isolation** between tenants and full customization of ward boundaries, department structures, SLA configurations, and user roles per tenant.

---

## Repository Topology

This is the **Root Orchestration Repository**. It contains infrastructure, documentation, CI/CD, and AntiGravity IDE agent configuration. Each service has its own dedicated GitHub repository.

```
GovOS/ (this repo — Root OS)
├── govos-core-api/         → Push separately to GitHub (Spring Boot)
├── govos-realtime/         → Push separately to GitHub (NestJS)
├── govos-ai/               → Push separately to GitHub (Python FastAPI)
├── govos-web/              → Push separately to GitHub (React 18)
├── .agents/                → AntiGravity IDE agent configuration
├── infra/                  → Docker Compose + Nginx
├── docs/                   → Architecture documentation
└── .github/                → CI/CD pipelines
```

| Repository | Tech Stack | Port | Description |
|------------|-----------|------|-------------|
| `govos-core-api` | Java 21, Spring Boot 3.x | 8080 | Primary transactional API (RBAC, MTAS, complaints, assets, projects) |
| `govos-realtime` | TypeScript, NestJS, Socket.IO | 3001 | Real-time WebSocket bridge + multi-channel notification delivery |
| `govos-ai` | Python 3.12, FastAPI | 8000 | AI governance assistant, geo-intelligence, workload allocation |
| `govos-web` | React 18, TypeScript, Vite | 5173 | Web OS frontend (11 modules, Leaflet maps, real-time dashboards) |

---

## Architecture Overview

```
                    ┌─────────────────────────┐
                    │   govos-web (React 18)   │
                    │   Browser Web OS Shell   │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │     Nginx API Gateway    │
                    │     (Port 80)            │
                    └──┬──────────┬────────┬──┘
                       │          │        │
          ┌────────────▼┐  ┌──────▼──┐  ┌─▼──────────┐
          │ Spring Boot  │  │  NestJS  │  │  FastAPI   │
          │  Core API   │  │ Realtime │  │  AI Service│
          │  :8080      │  │  :3001   │  │  :8000     │
          └──┬──┬──┬────┘  └────┬─────┘  └──┬──┬──┬──┘
             │  │  │      Redis  │           │  │  │
          ┌──▼┐ │  │  ┌─────────▼──┐        │  │  │
          │PG │ │  │  │   Redis    │◄────────┘  │  │
          └───┘ │  │  │   :6379   │            │  │
             ┌──▼┐ │  └────────────┘         ┌─▼┐ │
             │OS │ │                          │OS │ │
             └───┘ │                          └───┘ │
                ┌──▼──┐                          ┌──▼────┐
                │MinIO│                          │Vertex │
                │:9000│                          │  AI   │
                └─────┘                          └───────┘
```

---

## Quick Start (Local Development)

### Prerequisites
- Docker Desktop 4.x+
- Node.js 20+ (for frontend dev server)
- Java 21 (for Spring Boot — optional if using Docker only)
- Python 3.12 (for AI service — optional if using Docker only)

### 1. Clone and Setup

```bash
git clone https://github.com/prajna-labs/GovOS.git
cd GovOS

# Copy environment template
cp infra/docker/.env.example infra/docker/.env
# Edit infra/docker/.env with your values
```

### 2. Start Infrastructure + Backend Services

```bash
cd infra/docker
docker-compose up -d postgres redis minio opensearch
# Wait for health checks to pass (30-60 seconds)

docker-compose up -d govos-core-api govos-realtime govos-ai nginx
# Wait for services to start (60-120 seconds for Spring Boot)
```

### 3. Start Frontend Dev Server

```bash
cd govos-web
cp .env.example .env.local
# Edit .env.local with VITE_API_URL=http://localhost/api

npm install
npm run dev
# Frontend at http://localhost:5173
```

### Service Health Checks
- Core API: http://localhost:8080/actuator/health
- Realtime: http://localhost:3001/health
- AI Service: http://localhost:8000/health
- MinIO Console: http://localhost:9001
- OpenSearch: http://localhost:9200/_cluster/health

---

## 11 Platform Modules

| # | Module | Key Features |
|---|--------|-------------|
| 1 | Authentication | Phone OTP, Email+Password, TOTP MFA, JWT, multi-device sessions |
| 2 | Dashboard | Role-adaptive KPIs, live complaint queue, SLA countdowns, ward heatmap |
| 3 | Complaint Management | Full lifecycle, AI classification, GPS ward routing, SLA tracking |
| 4 | Citizen CRM | Constituent profiles, interaction logs, mass broadcast |
| 5 | Asset Management | Infrastructure registry, GIS map view, maintenance scheduling |
| 6 | Project Tracking | Milestone Gantt, budget tracking, contractor management |
| 7 | Document Management | Peshi (digital file movement), inward/outward register |
| 8 | Officer Management | Roster, workload view, SLA compliance scores |
| 9 | Notification System | SMS, Email, WhatsApp, Push, In-App — event-driven |
| 10 | Analytics & Reporting | Recharts visualizations, ward heatmaps, exportable reports |
| 11 | Administration | Tenant provisioning, RBAC, ward management, audit log |

---

## AntiGravity IDE Setup

This project is configured for **AntiGravity IDE** with Spec-Driven Development (SDD). The `.agents/` directory contains:

| File | Purpose |
|------|---------|
| `.agents/agents.md` | 5 specialized agent personas |
| `.agents/context.md` | Global project context and invariants |
| `.agents/workflows/scaffold-feature.md` | `/scaffold:feature` command |
| `.agents/workflows/scaffold-api-route.md` | `/scaffold:api-route` command |
| `.agents/workflows/scaffold-migration.md` | `/scaffold:migration` command |
| `.agents/workflows/generate-spec.md` | `/gen:spec` command (SDD) |
| `.agents/workflows/run-tests.md` | `/run:tests` command |

Each service has its own `.rules` file that configures the active agent persona for that workspace:
- `govos-core-api/.rules` → SpringArchitect
- `govos-realtime/.rules` → RealtimeEngineer
- `govos-ai/.rules` → AIEngineer
- `govos-web/.rules` → WebOSFrontend

---

## Technology Stack

### Backend (Polyglot Microservices)
- **Core API:** Spring Boot 3.x, Java 21, PostgreSQL 16+PostGIS, Flyway, Hibernate/JPA, Spring Security 6, MinIO, OpenSearch, Redis
- **Realtime:** NestJS 10, TypeScript, Socket.IO 4, Redis pub/sub, MSG91, SendGrid, Twilio, FCM
- **AI Service:** Python 3.12, FastAPI 0.111, Google Gen AI SDK (Gemini), GeoPandas, asyncpg, OpenSearch

### Frontend
- React 18, TypeScript (strict), Vite 5
- Zustand (global state), TanStack Query v5 (server state)
- Tailwind CSS v3, shadcn/ui, Framer Motion
- react-leaflet (maps), Recharts (analytics)
- react-hook-form + Zod (forms)
- Socket.IO Client (real-time)

### Infrastructure
- Docker + Docker Compose (local dev)
- Nginx (API gateway + reverse proxy)
- PostgreSQL 16 + PostGIS
- Redis 7
- MinIO (S3-compatible object storage)
- OpenSearch 2.x (audit logs + full-text search)
- GitHub Actions (CI/CD)

---

## Security Principles

1. **Tenant isolation is absolute** — every query filters by `tenant_id` from JWT
2. **PostgreSQL Row-Level Security** — enforced at DB level for defense in depth
3. **JWT in memory** — access token in Zustand memory, refresh token in httpOnly cookie
4. **Argon2id** for all password hashing
5. **Audit log** — immutable, tamper-proof record of all CUD operations in OpenSearch
6. **Soft delete only** — no hard deletes anywhere in the system

---

## License

CONFIDENTIAL — All rights reserved. © Prajna Labs × Cascade Technologies Solutions
