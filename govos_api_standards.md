# GovOS — API Standardization Specification
**Milestone:** M0.5 — Codebase Hardening & Cleanup
**Date:** August 29, 2026

---

## 1. Overview & Standard API Conventions

GovOS standardizes all HTTP REST API endpoints across microservices under `/api/v1/`.

### Core Standards:
- **Base URL Prefix:** `/api/v1`
- **Naming Convention:** Kebab-case resource paths (e.g., `/api/v1/public/complaints`, `/api/v1/officers`)
- **HTTP Methods:**
  - `GET` — Retrieve resource(s) (idempotent, no side effects)
  - `POST` — Create a new resource or execute complex action
  - `PUT` / `PATCH` — Update existing resource
  - `DELETE` — Soft delete resource (`is_deleted = true`, `deleted_at = NOW()`)

---

## 2. Standardized JSON Response Structure

All API responses MUST follow a uniform JSON payload contract:

### A. Success Response (Single Resource / Mutation)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "c1a2b3c4-0000-0000-0000-000000000001",
    "complaintNumber": "CMP-2026-0829-001",
    "status": "SUBMITTED"
  }
}
```

### B. Success Response (Paginated Collection)
```json
{
  "success": true,
  "data": {
    "items": [ /* array of records */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### C. Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error description",
  "code": "INVALID_INPUT_PARAMS",
  "details": [
    {
      "field": "mobile",
      "issue": "Enter a valid 10-digit mobile number"
    }
  ]
}
```

---

## 3. Current Endpoint Inventory & Compatibility Strategy

| Endpoint Path | Method | Auth Required | Purpose | Current Backend | Compatibility Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/public/complaints` | `POST` | None | Submit citizen complaint | Express / Spring Boot | Endpoint path matches in both backends |
| `/api/v1/public/complaints/{num}`| `GET` | None | Public complaint tracking | Express / Spring Boot | Sanitized fields returned |
| `/api/v1/auth/request-otp` | `POST` | None | Citizen OTP login request | Express | Keep contract intact during Spring port |
| `/api/v1/auth/verify-otp` | `POST` | None | Verify OTP and return JWT | Express | Keep contract intact during Spring port |
| `/api/v1/complaints` | `GET` | Bearer JWT | Fetch complaints list | Express | Keep response data fields identical |
| `/api/v1/complaints` | `POST` | Bearer JWT | Create authenticated complaint| Express | Keep response data fields identical |
| `/api/v1/complaints/{id}` | `GET` | Bearer JWT | Fetch complaint details | Express | Keep response data fields identical |
| `/api/v1/complaints/{id}/status`| `PATCH` | Bearer JWT | Update complaint status | Express | Keep response data fields identical |
| `/api/v1/officers` | `GET` | Bearer JWT | List department officers | Express | Keep response data fields identical |

---

## 4. Authentication Header Standards

- **Primary Authorization:**
  `Authorization: Bearer <JWT_TOKEN>`
- **Tenant Context (Implicit):**
  Extracted from JWT payload claim `tid` (tenant ID).
- **Service-to-Service Authorization:**
  `X-Service-Key: <SHARED_INTERNAL_SECRET>`
- **Development Header Gating:**
  `x-user-email` is restricted strictly to non-production environments (`NODE_ENV !== 'production'`) and logs a warning on usage.
