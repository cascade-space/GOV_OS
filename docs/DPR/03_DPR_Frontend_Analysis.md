# GovOS — Detailed Project Report (DPR)
## Part 3: Frontend Analysis — UI/UX, Portals, CRUD Operations & Pending Work

**Date:** September 15, 2026

---

## 1. FRONTEND ARCHITECTURE OVERVIEW

The public-landing-page (Next.js 16 App Router) is the ACTIVE, functional frontend.
It serves 6 distinct portals from a single codebase using route-based isolation.

**Key Libraries:**
- Next.js 16 (Turbopack, App Router, Server Components)
- Tailwind CSS + Framer Motion (animations + transitions)
- Mapbox GL / react-map-gl (geospatial map features)
- Recharts (analytics dashboards)
- Cloudinary (file uploads for complaint evidence)
- next-intl (Internationalization: English + Kannada)
- Zustand (client-side auth state)
- Socket.IO client (realtime — connection stub exists, no live data)
- react-hook-form + zod (form validation)
- Lucide React (icon system)

---

## 2. PUBLIC LANDING PAGE (/) — ~85% Complete

**Purpose:** Public-facing civic portal for all citizens. No login required.

### Sections Implemented
| Section | Status | Notes |
|---------|--------|-------|
| Hero section with complaint tracker | COMPLETE | Real-time tracking by complaint number |
| Stats counter bar | COMPLETE | Animated stats (complaints resolved, satisfaction rate, etc.) |
| How it works flow | COMPLETE | 4-step visual guide |
| Impact by numbers section | COMPLETE | Metric cards with animation |
| Category quick links | COMPLETE | INFRASTRUCTURE, WATER, SANITATION, POWER, etc. |
| Success stories / testimonials | COMPLETE | Citizen testimonial cards |
| Portal quick-access cards | COMPLETE | Links to Citizen / Officer / Admin portals |
| Public footer | COMPLETE | Social links, navigation, contact |
| Multi-language switcher | COMPLETE | EN / KN toggle |

### Language Support (next-intl)
- English (messages/en.json) — COMPLETE
- Kannada (messages/kn.json) — COMPLETE
- Language switcher component in navbar

### Pending on Landing Page
- Live statistics from real API (currently using placeholder values)
- Map showing active complaints in area
- News/announcements section not wired to real data

---

## 3. CITIZEN PORTAL (/citizen/) — ~55% Complete

**Purpose:** Allow citizens to submit complaints, track status, and view history. No login required for core flows.

### Routes

| Route | Component | Status |
|-------|-----------|--------|
| /citizen/ | Redirect to track | PARTIAL |
| /citizen/report | Complaint submission form | COMPLETE |
| /citizen/track | Track by complaint number or mobile | COMPLETE |
| /citizen/track?id={number} | Direct tracking URL | COMPLETE |
| /citizen/dashboard | Citizen dashboard (after optional login) | PARTIAL |
| /citizen/login | Citizen OTP login | PARTIAL |

### Complaint Submission Form (/citizen/report) — COMPLETE
- Fields: Name, Mobile (10-digit validation), Title, Description
- Location: Mapbox map pin drop + manual address entry
- Photo upload: Cloudinary integration
- Sub-category selection
- Multi-language (EN/KN)
- Calls: POST /api/v1/public/complaints
- Returns complaint number for tracking

### Complaint Tracking (/citizen/track) — COMPLETE
- Search by complaint number (CMP-GV-YYYYMM-XXXX format) or mobile number
- Shows: status badge, category, priority, officer assigned, resolution notes, evidence photo
- Timeline: shows all status transitions
- Calls: GET /api/v1/public/complaints/{complaintNumber}

### Pending in Citizen Portal
- Citizen login flow (OTP-based) — form exists but API integration incomplete
- Post-login dashboard showing all complaints by mobile
- Rating/feedback form after complaint resolved
- Reopen complaint flow UI
- Push notification subscription (FCM)
- Map view of own complaints

---

## 4. OFFICER PORTAL (/officer/) — ~50% Complete

**Purpose:** Field officers manage their assigned tasks, upload evidence, and update complaint status.

### Routes

| Route | Component | Status |
|-------|-----------|--------|
| /officer/login | Officer login (JWT/OTP) | COMPLETE |
| /officer/dashboard | Task dashboard + stats | PARTIAL |
| /officer/tasks | List of assigned tasks | PARTIAL |
| /officer/tasks/[id] | Task detail + action flow | PARTIAL |
| /officer/history | Completed task history | PARTIAL |
| /officer/profile | Officer profile + settings | PARTIAL |

### Officer Dashboard (/officer/dashboard) — PARTIAL
- Stat cards: Active Tasks, Completed Today, SLA Breached, Rating
- Task list with priority/SLA countdown
- Map view showing task locations on Mapbox
- Calls: GET /api/v1/officers/me/tasks

### Task Detail Page (/officer/tasks/[id]) — PARTIAL
- Complaint details display
- Status update buttons: Start Work, Complete Work
- Evidence upload (Cloudinary)
- Resolution GPS capture
- Notes textarea
- SLA countdown timer (client-side from sla_deadline)
- Calls: POST /api/v1/officers/me/tasks/{id}/start + /complete

### Pending in Officer Portal
- Rework handling — officer receives rework notice and re-executes
- SLA breach visual alerts (banner + notification)
- Real-time task arrival via WebSocket (currently requires page refresh)
- Complete SLA countdown connected to backend sla_deadline
- Profile edit (designation, phone, avatar)
- Complaint photo evidence upload — Cloudinary integration partial
- Offline mode (PWA for field officers without stable internet)

---

## 5. MLA PORTAL (/mla/) — ~45% Complete

**Purpose:** Elected representatives monitor constituency complaints, issue directives, and track governance metrics.

### Routes

| Route | Component | Status |
|-------|-----------|--------|
| /mla/dashboard | Constituency overview | PARTIAL |
| /mla/issues | All constituency complaints list | PARTIAL |
| /mla/issues/[id] | Issue detail + directive form | PARTIAL |
| /mla/directives | Issued directives list | PARTIAL |

### MLA Dashboard (/mla/dashboard) — PARTIAL
- Stat cards: Total Complaints, Resolved, SLA Breached, Pending Directives
- Complaint heatmap by ward (Mapbox)
- Category breakdown chart (Recharts)
- Recent directive cards

### Issue Detail + Directive Form (/mla/issues/[id]) — PARTIAL
- Full complaint details
- Issue Directive modal: directive_type, instruction_notes fields
- Directive status tracking
- Calls: POST /api/v1/directives, GET /api/v1/directives

### Pending in MLA Portal
- Real-time notification when complaint resolved (WebSocket)
- Export reports (PDF/CSV of constituency complaints)
- Directive follow-up tracking (are admins acting on directives?)
- Analytics: resolution rate trends, officer performance, ward comparisons
- Map-based constituency boundary visualization

---

## 6. ADMIN PORTAL (/admin/) — ~60% Complete

**Purpose:** Department heads and Tenant Admins manage officers, complaints, departments, and analytics.

### Routes

| Route | Component | Status |
|-------|-----------|--------|
| /admin/login | Admin login | COMPLETE |
| /admin/dashboard | Admin overview dashboard | COMPLETE |
| /admin/complaints | Complaints management | PARTIAL |
| /admin/analytics | Analytics & reports | PARTIAL |
| /admin/announcements | Post announcements to citizens | PARTIAL |
| /admin/settings | Admin settings | PARTIAL |

### Admin Dashboard (/admin/dashboard) — COMPLETE
- Stats: Total Complaints, Active, Resolved, SLA Breached
- Charts: Complaints by status (pie), Complaints over time (line)
- Recent complaints table with quick-assign modal
- Officer workload view
- Calls: GET /api/v1/analytics/summary + /complaints

### Complaints Management (/admin/complaints) — PARTIAL

**CRUD Operations:**

| Operation | UI | API | Status |
|-----------|-----|-----|--------|
| List complaints | Table with filters (status, category, priority, date) | GET /api/v1/complaints | COMPLETE |
| View complaint detail | Modal/drawer with full info | GET /api/v1/complaints/{id} | COMPLETE |
| Assign complaint to officer | Assignment modal with officer dropdown | POST /api/v1/complaints/{id}/assign | COMPLETE |
| Update status (admin override) | Status dropdown | POST /api/v1/complaints/{id}/status | PARTIAL |
| Verify resolved complaint | Verify button + notes | POST /api/v1/complaints/{id}/verify | PARTIAL |
| Request rework | Rework modal with reason | POST /api/v1/complaints/{id}/rework | PARTIAL |
| Create complaint (internal) | Create modal form | POST /api/v1/complaints | PARTIAL |
| Delete complaint | Soft delete | DELETE /api/v1/complaints/{id} | MISSING |
| Export complaints | CSV/PDF export | Not implemented | MISSING |

### Analytics (/admin/analytics) — PARTIAL
- Complaint volume chart (Recharts LineChart)
- Status distribution chart (Recharts PieChart)
- Category breakdown (BarChart)
- Missing: SLA compliance rate, officer performance, ward heatmap, time period filters

### Pending in Admin Portal
- Officer management CRUD (create, edit, deactivate officers) — UI exists partially
- Department management CRUD — UI missing
- Ward management — UI missing
- SLA policy configuration UI
- Announcement editor (rich text)
- Report generation (PDF export)
- Real-time complaint arrival notifications (WebSocket)

---

## 7. SUPERADMIN PORTAL (/superadmin/) — ~50% Complete

**Purpose:** GovOS platform operator manages all tenants, constituencies, global analytics.

### Routes

| Route | Component | Status |
|-------|-----------|--------|
| /superadmin/login | SuperAdmin login | COMPLETE |
| /superadmin/dashboard | Platform overview | PARTIAL |
| /superadmin/complaints | Cross-tenant complaint view | PARTIAL |
| /superadmin/constituencies | Constituency management | PARTIAL |
| /superadmin/officers | Platform-wide officer view | PARTIAL |
| /superadmin/users | Platform-wide user management | PARTIAL |
| /superadmin/analytics | Platform analytics | PARTIAL |

### SuperAdmin Dashboard — PARTIAL
- Platform-level stats: Total tenants, total complaints, platform SLA rate
- Tenant health cards
- Cross-tenant complaint table

### CRUD Operations Status

| Entity | Create | Read | Update | Delete | Status |
|--------|--------|------|--------|--------|--------|
| Tenants | UI Missing | PARTIAL | UI Missing | UI Missing | SCHEMA |
| Constituencies | UI Missing | PARTIAL | UI Missing | UI Missing | SCHEMA |
| Officers | PARTIAL | PARTIAL | Missing | Missing | PARTIAL |
| Users | PARTIAL | PARTIAL | Missing | Missing | PARTIAL |

---

## 8. COMPLETE CRUD OPERATION MATRIX

### Backend + Frontend CRUD Status

| Entity | DB Table | Backend API | Frontend Create | Frontend Read | Frontend Update | Frontend Delete |
|--------|----------|-------------|-----------------|---------------|-----------------|-----------------|
| Tenants | tenants | Missing | Missing | PARTIAL | Missing | Missing |
| Constituencies | constituencies | Missing | Missing | PARTIAL | Missing | Missing |
| Wards | wards | Missing | Missing | PARTIAL | Missing | Missing |
| Departments | departments | PARTIAL | Missing | PARTIAL | Missing | Missing |
| Users | users | PARTIAL | PARTIAL | PARTIAL | Missing | Missing |
| Officer Profiles | users + officer_profiles | PARTIAL | PARTIAL | PARTIAL | Missing | Missing |
| Complaints (Internal) | complaints | COMPLETE | PARTIAL | COMPLETE | PARTIAL | Missing |
| Complaints (Public) | complaints | COMPLETE | COMPLETE | COMPLETE | N/A | N/A |
| MLA Directives | mla_directives | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Civic Assets | civic_assets | Missing | Missing | Missing | Missing | Missing |
| Civic Projects | civic_projects | Missing | Missing | Missing | Missing | Missing |
| Documents | documents | Missing | Missing | Missing | Missing | Missing |
| Document Movements | document_movements | Missing | Missing | Missing | Missing | Missing |
| Audit Logs | audit_logs | Read-only | N/A | Missing | N/A | N/A |
| Integration Configs | integration_configs | Missing | Missing | Missing | Missing | Missing |
| Announcements | Not in DB yet | Missing | Missing | Missing | Missing | Missing |
| SLA Policies | sla_policies | Read-only via scheduler | N/A | Missing | Missing | N/A |

---

## 9. MODALS & UI/UX FLOWS ANALYSIS

### Implemented Modals

| Modal | Portal | Purpose | Status |
|-------|--------|---------|--------|
| Complaint Assignment Modal | Admin | Assign complaint to officer | COMPLETE |
| Complaint Detail Drawer | Admin | View full complaint + actions | PARTIAL |
| Create Complaint Modal | Admin | Internal complaint creation | PARTIAL |
| Issue Directive Modal | MLA | Issue directive on complaint | PARTIAL |
| Officer Complete Work Modal | Officer | Submit resolution + evidence | PARTIAL |
| Complaint Rating Modal | Citizen | Rate resolved complaint | PARTIAL |

### Missing Modals

| Modal | Portal | Purpose |
|-------|--------|---------|
| Create Officer Modal | Admin | Onboard new field officer |
| Edit Officer Modal | Admin | Update officer details |
| Create Department Modal | Admin | Add department |
| Create Tenant Modal | SuperAdmin | Onboard new municipality |
| Asset Detail Modal | Admin | View/edit civic asset |
| Project Progress Modal | Admin | Update project completion % |
| Document Upload Modal | Admin | Peshi document management |
| Document Movement Modal | Admin | Track file custody transfer |
| Integration Config Modal | SuperAdmin | Configure external system webhook |
| Rework Request Modal | Admin | Request rework with reason |
| Escalation Override Modal | Admin | Manual escalation |
| SLA Policy Edit Modal | SuperAdmin/Admin | Configure SLA hours per priority |
| Export Modal | Admin/MLA | Export to CSV/PDF |
| Announcement Editor | Admin | Post public announcement |

---

## 10. WHAT IS PENDING / WHAT NEEDS TO BE COMPLETED

### Frontend Work Remaining — Prioritized

#### CRITICAL (required for MVP)
1. Officer full CRUD UI: create, edit, deactivate officers in Admin portal
2. Real-time WebSocket integration: requires NestJS gateway to be built first
3. Citizen feedback/rating form after complaint resolved
4. Officer rework handling UI (receive notice, re-execute, re-submit)
5. SLA countdown timer properly wired to sla_deadline from backend

#### HIGH PRIORITY
6. Asset management UI (CRUD) — list, create, update assets in Admin portal
7. Project management UI (CRUD) — track project progress, budget, completion %
8. Document/Peshi management UI — upload, move, track file custody
9. Department management CRUD UI
10. Analytics: SLA compliance, officer performance, ward heatmap, time-series filters
11. Export (CSV/PDF) for complaints, analytics

#### MEDIUM PRIORITY
12. MLA directive enforcement tracking UI
13. Constituency/Ward management UI for SuperAdmin
14. Tenant management UI for SuperAdmin
15. Integration Hub UI — configure external systems, view sync logs
16. Rich-text announcement editor + publish flow
17. Notification tray — real-time events bell icon with unread count
18. Profile edit pages for all portal types
19. Map-based complaint heatmap on dashboards

#### LOW PRIORITY / FUTURE
20. PWA / Offline mode for officers in field
21. Aadhaar verification UI
22. TOTP/MFA setup flow
23. govos-web (React/Vite Web OS) full implementation
24. Dark mode across all portals
25. Print-friendly complaint detail view

---

## 11. REMAINING DEVELOPMENT ESTIMATE

| Work Area | Estimated Effort |
|-----------|-----------------|
| Complete NestJS realtime (WebSocket + SMS/Email/Push) | 2-3 weeks |
| Complete backend service layers (Assets, Projects, Documents, Integration) | 2-3 weeks |
| Complete officer CRUD (frontend + backend) | 1 week |
| Complete analytics (backend + frontend) | 1-2 weeks |
| Wire real OTP delivery (MSG91/SendGrid) | 3-5 days |
| Complete GeoPandas ward resolution in AI service | 1 week |
| Complete citizen portal (login, rating, reopen flows) | 1 week |
| Complete MLA portal analytics + export | 1 week |
| Complete SuperAdmin tenant + constituency management | 1-2 weeks |
| Integration tests (TestContainers) | 2-3 weeks |
| Kubernetes manifests + CI/CD pipeline | 2 weeks |
| Production hardening (Nginx, rate limiting, monitoring) | 1 week |

**Estimated Total Remaining: 15-20 developer-weeks to reach production readiness**
