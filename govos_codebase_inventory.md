# GovOS — Codebase Inventory
**Milestone:** M0.5 — Codebase Hardening & Cleanup
**Date:** August 29, 2026

---

## 1. Executive Summary

This codebase inventory categorizes every application, microservice, module, route, database artifact, dependency, and legacy component in the GovOS workspace. Every item is marked with an explicit disposition status:
- `KEEP`: Active, high-quality, production-ready code.
- `REFACTOR`: Active code requiring security, architectural, or quality improvements.
- `MIGRATE`: Code to be transitioned from Express/legacy to Spring Boot/NestJS in future milestones.
- `DEPRECATE`: Legacy code retained for backwards compatibility until full migration.
- `REMOVE AFTER VERIFICATION`: Dead code, redundant empty directories, or unused test scripts candidate for deletion after validation.

---

## 2. Applications & Services Inventory

| Application / Service | Path | Tech Stack | Status | Disposition | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **govos-web** | `/govos-web` | React 18, Vite, TypeScript, Zustand, Tailwind | Active | `KEEP` | Primary Web OS Frontend shell & 11 sub-modules |
| **govos-core-api** | `/govos-core-api` | Java 21, Spring Boot 3, JPA, Flyway | In-Progress | `REFACTOR` | Target business logic engine & REST APIs |
| **govos-realtime** | `/govos-realtime` | Node.js, NestJS, Socket.IO, Redis | In-Progress | `REFACTOR` | Target WebSocket bus & multi-channel notification engine |
| **govos-ai** | `/govos-ai` | Python 3.11, FastAPI, GeoPandas, Gemini | In-Progress | `KEEP` | Spatial analysis & AI intelligence engine |
| **public-landing-page** | `/public-landing-page` | Next.js 16, Tailwind, Lucide | Active | `KEEP` | Public-facing citizen portal & landing website |
| **Express Backend** | `/public-landing-page/backend` | Node.js, Express.js, PostgreSQL (`pg`) | Active (Legacy) | `DEPRECATE` | Current active backend supporting frontend during migration |

---

## 3. Frontend Modules Inventory (`govos-web`)

| Module / Feature | Location | Key Components | Disposition | Description |
| :--- | :--- | :--- | :--- | :--- |
| **OS Shell** | `src/shell/` | `AppShell`, `Sidebar`, `TopBar`, `CommandPalette` | `KEEP` | Core Web OS window layout & navigation |
| **Auth Store** | `src/store/auth.store.ts` | Zustand Persist | `REFACTOR` | User token & tenant state store |
| **Complaints Module** | `src/features/complaints/` | `ComplaintList`, `ComplaintDetail`, `CreateModal` | `KEEP` | Citizen & Officer complaint UI |
| **Dashboard** | `src/features/dashboard/` | `AdminDashboard`, `OfficerDashboard` | `KEEP` | KPI cards and status breakdown views |
| **Officers Module** | `src/features/officers/` | `OfficerList`, `WorkloadManager` | `KEEP` | Department roster management UI |
| **Map / GIS** | `src/features/map/` | `WardMap`, `Heatmap` | `KEEP` | Leaflet spatial visualization |
| **Assets Module (UI)** | `src/features/assets/` | `AssetList` | `DEPRECATE` | UI placeholder; no backend schema exists yet |
| **Projects Module (UI)**| `src/features/projects/` | `ProjectList` | `DEPRECATE` | UI placeholder; no backend schema exists yet |
| **Documents (UI)** | `src/features/documents/` | `DocumentList` | `DEPRECATE` | UI placeholder; no backend schema exists yet |

---

## 4. Backend Controllers & API Routes Inventory

### A. Express Backend (`public-landing-page/backend/src`)
| Controller / Route | Endpoint Path | Functionality | Disposition | Action Plan |
| :--- | :--- | :--- | :--- | :--- |
| `auth.controller.js` | `/api/v1/auth/*` | Citizen OTP Request & Verification | `REFACTOR` | Hardened JWT & mock OTP in M0.5 |
| `complaint.controller.js` | `/api/v1/complaints/*` | Complaint CRUD, Assign, Track | `DEPRECATE` | Porting to Spring Boot in M4 |
| `officer.controller.js` | `/api/v1/officers/*` | Officer list & status update | `DEPRECATE` | Porting to Spring Boot in M4 |
| `admin.controller.js` | `/api/v1/admin/*` | Department & user admin | `DEPRECATE` | Porting to Spring Boot in M4 |
| `mla.controller.js` | `/api/v1/mla/*` | Representative directives | `DEPRECATE` | Porting to Spring Boot in M4 |
| `superadmin.routes.js` | `/api/v1/superadmin/*` | Global platform overview | `DEPRECATE` | Porting to Spring Boot in M4 |

### B. Spring Boot (`govos-core-api/src/main/java/com/govos/core`)
| Controller / Package | Target Endpoints | Status | Disposition |
| :--- | :--- | :--- | :--- |
| `presentation/complaint/PublicComplaintController.java` | `/api/v1/public/complaints` | Built | `KEEP` |
| `presentation/complaint/ComplaintController.java` | `/api/v1/complaints` | Shell | `REFACTOR` |
| `presentation/auth/` | `/api/v1/auth` | Shell | `REFACTOR` |
| `presentation/complaints/` (Empty Dir) | N/A | Empty | `REMOVE AFTER VERIFICATION` |
| `presentation/assets/` (Empty Dir) | N/A | Empty | `REMOVE AFTER VERIFICATION` |
| `presentation/citizens/` (Empty Dir) | N/A | Empty | `REMOVE AFTER VERIFICATION` |
| `presentation/officers/` (Empty Dir) | N/A | Empty | `REMOVE AFTER VERIFICATION` |
| `presentation/projects/` (Empty Dir) | N/A | Empty | `REMOVE AFTER VERIFICATION` |

---

## 5. Database Artifacts Inventory

| File / Folder | Purpose | Disposition | Notes |
| :--- | :--- | :--- | :--- |
| `public-landing-page/database/schema.sql` | Legacy Monolithic SQL | `DEPRECATE` | Current active database schema for local dev |
| `01_add_tenants_and_rls.sql` | Tenant & RLS Migration Script | `KEEP` | Staged for M2 database execution |
| `govos-core-api/.../db/migration/V1__V11` | Flyway Versioned Migrations | `KEEP` | Production versioned database migrations |
| `public-landing-page/database/fix-internal-db.js` | One-off Fix Script | `REMOVE AFTER VERIFICATION` | Legacy setup helper |
| `public-landing-page/database/add-citizen-columns.sql` | Ad-hoc SQL Patch | `DEPRECATE` | Merged into main schema |

---

## 6. Dead / Unused Code Candidates

1. Empty directories in `govos-core-api`:
   - `presentation/complaints`
   - `presentation/assets`
   - `presentation/citizens`
   - `presentation/officers`
   - `presentation/projects`
2. One-off legacy deployment scripts in `public-landing-page/`:
   - `fix-internal-db.js`
   - `fix-render-db-columns.js`
   - `add-sample-departments.js`
3. Duplicate static HTML files in root:
   - `curl_output.html` (scratch output)

---

## 7. Mock / Demo Code Inventory

| Item | Location | Current State | M0.5 Hardening Action |
| :--- | :--- | :--- | :--- |
| Mock OTP `123456` | `auth.controller.js` | Hardcoded in response | Restricted to development logs only |
| Default JWT Secret | `auth.controller.js`, `complaint.controller.js` | Fallback `'civicpath_citizen...'` | Replaced with standard env check |
| Unauthenticated `x-user-email` | `adminAuth.middleware.js`, `officerAuth.middleware.js` | Direct header check | Enforced JWT token check first; header restricted to dev mode |
