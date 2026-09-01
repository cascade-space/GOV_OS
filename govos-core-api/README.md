# govos-core-api — Spring Boot Core API

**GovOS Multi-Tenant Civic Governance Platform**
*Prajna Labs × Cascade Technologies Solutions*

---

## Overview

The Core API is the primary transactional engine of GovOS. It implements a **Hexagonal Architecture (Ports & Adapters)** with strict multi-tenant data isolation, role-based access control, and a comprehensive audit framework.

**Tech Stack:** Java 21 · Spring Boot 3.x · PostgreSQL 16+PostGIS · Flyway · Redis · MinIO · OpenSearch

---

## Package Structure

```
com.govos.core/
├── domain/          ← Pure business rules (no Spring annotations)
├── application/     ← Use cases, @Service, @Transactional
├── infrastructure/  ← DB, MinIO, Redis, OpenSearch adapters
└── presentation/    ← @RestController, DTOs
```

## Quick Start

```bash
# Prerequisites: Java 21, Maven 3.9+, PostgreSQL running (see docker-compose)

cp src/main/resources/application-dev.yml.example src/main/resources/application-dev.yml
# Edit application-dev.yml with local credentials

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# API at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

## Testing

```bash
./mvnw test                  # Unit tests
./mvnw verify -P integration  # Integration tests (needs DB)
./mvnw jacoco:report          # Coverage report → target/site/jacoco/
```

## API Base URL: `/api/v1/`

### Authentication
- `POST /api/v1/auth/otp/request` — Request phone OTP
- `POST /api/v1/auth/otp/verify` — Verify OTP + get JWT
- `POST /api/v1/auth/login` — Email + password login
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/logout` — Invalidate session

### Core Modules
All routes require `Authorization: Bearer {token}` + `X-Tenant-ID: {uuid}` headers.

See `docs/api-contracts/core-api.yaml` for full OpenAPI specification.

---

## AntiGravity IDE
- Active Agent: **SpringArchitect**
- Rules file: `.rules` (in this directory)
- Read `.rules` before any code generation task
