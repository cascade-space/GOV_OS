# GovOS — Persona 5: MLA / Elected Representative
## User Journey Documentation

**Portal:** /mla/
**Authentication:** JWT (OTP login)
**Reference:** Amrut Desai, MLA Dharwad Assembly Constituency #71

---

## WHO IS THIS PERSON?

Amrut Desai is the elected MLA for the Dharwad constituency (Assembly Seat #71).
He does not manage complaints operationally — he monitors them politically.
His voters call him when their complaints aren't resolved. He needs data, not admin access.

### Persona Profile
| Attribute | Value |
|-----------|-------|
| Tech comfort | Low (staff operates the portal on his behalf) |
| Primary language | Kannada |
| Device | iPad (staff) + Android (personal) |
| Motivation | Constituent satisfaction = political capital |
| Pain point | "I don't know which complaints are pending in my area" |
| Success metric | 0 SLA-breached complaints with no directive issued |

---

## JOURNEY 1: Monitoring Constituency Dashboard

STEP 1 — Login (/mla/login)
  OTP login, JWT issued with role: REP, constituency: DHARWAD-71

STEP 2 — Dashboard (/mla/dashboard)
  API Calls:
    GET /api/v1/complaints (filtered by constituency / wards under DHARWAD-71)
    GET /api/v1/analytics/summary

  UI shows:
    Stat cards:
      🔴 SLA Breached: 7
      🟡 Open Complaints: 43
      ✅ Resolved This Month: 189
      📋 Active Directives: 3

    Ward-level heatmap (Mapbox): WARD-01 to WARD-08 color-coded by complaint density
    Category breakdown (Recharts BarChart): WATER 12, INFRA 18, SANITATION 8, POWER 5
    Resolution rate trend (LineChart): last 30 days

STEP 3 — Drill into SLA-breached complaints
  Amrut taps: "7 SLA Breached" card
  Filtered list shows: complaints WHERE sla_breached = TRUE AND status NOT IN (RESOLVED, CLOSED)

---

## JOURNEY 2: Issuing a Directive

### Context
CMP-HDMC-202609-0039 (pothole, HIGH priority, SLA breached, day 3 unresolved).
A constituent has called Amrut's office about it. He wants it escalated with binding instruction.

STEP 1 — Find the complaint (/mla/issues)
  Amrut's staff searches by complaint number or ward filter
  Taps on CMP-HDMC-202609-0039

STEP 2 — View issue detail (/mla/issues/CMP-HDMC-202609-0039)
  UI shows full complaint card:
    Title: "Large pothole causing accidents — Gandhinagar Circle"
    Status: IN_PROGRESS | SLA: BREACHED (32 hours overdue)
    Category: INFRASTRUCTURE | Priority: HIGH → escalated to CRITICAL
    Assigned To: Officer Ravi Kumar (PWD)
    Evidence: No photo yet

  Action available: [Issue Directive] button

STEP 3 — Issue directive
  UI: "Issue Directive" modal opens
  Fields:
    Directive Type: [dropdown] PRIORITY_ESCALATION / RESOURCE_ALLOCATION / INVESTIGATION / DEADLINE_OVERRIDE
    MLA Name: "Amrut Desai" (auto-filled from JWT)
    Constituency: "Dharwad" (auto-filled)
    Instruction Notes: [textarea — required]

  Amrut's staff types:
    Type: PRIORITY_ESCALATION
    Notes: "This pothole at Gandhinagar Circle has caused 2 accidents in 3 days.
            Immediate repair is mandated. Asphalt repair team to be deployed by tomorrow
            6 AM. Commissioner to be informed if not resolved by EOD."

STEP 4 — Submit directive
  API Call: POST /api/v1/mla/directives
  Body: {
    complaintId: UUID,
    mlaName: "Amrut Desai",
    constituency: "Dharwad",
    directiveType: "PRIORITY_ESCALATION",
    instructionNotes: "This pothole at Gandhinagar..."
  }

  IMPORTANT — WHO ACTUALLY CALLS THIS API:
  MlaDirectiveController.java line 24:
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
  The REP role is NOT authorized to call this endpoint.
  In practice: The Admin staff (TENANT_ADMIN) issues the directive on behalf of Amrut Desai.
  REP-role self-service directive issuance is a planned feature, not yet implemented.

  Backend:
    MlaDirectiveService.issueDirective(tenantId, complaintId, mlaName, constituency,
                                       directiveType, instructionNotes, userId)
    New MlaDirective created in mla_directives table:
      status: ACTIVE
      is_deleted: false

  UI confirmation: "ನಿರ್ದೇಶನ ನೀಡಲಾಗಿದೆ" (Directive issued)
  Directive appears in /mla/directives list

  Source: MlaDirectiveController.java, MlaDirectiveService.java, mla_directives table (V13)

---

## JOURNEY 3: Monitoring Directives

STEP 1 — Navigate to /mla/directives
  API Call: GET /api/v1/mla/directives/constituency/Dharwad
  UI: Table of all issued directives
    Columns: Complaint#, Title, Directive Type, Instructions, Status, Issued On

  Status values:
    🟡 ACTIVE — Admin has seen it, work in progress
    ✅ COMPLETED — Complaint resolved after directive
    ❌ CANCELLED — Amrut cancelled it (complaint resolved another way)

---

## WHAT AMRUT CANNOT DO (Permissions Boundary)
- He CANNOT assign complaints to specific officers (that is Admin's job)
- He CANNOT close or resolve complaints directly
- He CANNOT see data from other constituencies (RLS + constituency filter)
- He CANNOT access individual officer performance data
- He CANNOT delete complaints or audit logs
- He CAN only issue directives (write) and view constituency data (read)

---

# GovOS — Persona 6: Tenant Admin (Municipality Admin)
## User Journey Documentation

**Portal:** /admin/
**Authentication:** JWT (email + password or OTP)
**Reference:** Demo Tenant Admin | demo.govos.in

---

## WHO IS THIS PERSON?

The Tenant Admin is the municipal commissioner's office representative.
They manage the full operational lifecycle of GovOS within their municipality.

---

## JOURNEY 1: Daily Operations Dashboard

STEP 1 — Login (/admin/login)
STEP 2 — Dashboard (/admin/dashboard)
  API Calls:
    GET /api/v1/analytics/summary
    GET /api/v1/complaints (with filters)
    GET /api/v1/admin/users (officers list)

  UI shows:
    Top stats: Total Complaints, Active, SLA Breached, Avg Resolution Time
    Priority alerts: Complaints awaiting assignment (NEW status)
    Assignment queue: unassigned complaints with 1-click assign
    MLA Directives: Active directives requiring attention
    Officer workload: mini cards showing each officer's active count

---

## JOURNEY 2: Assigning a Complaint to an Officer

STEP 1 — See NEW complaints in assignment queue
  Complaint CMP-HDMC-202609-0051 — status: NEW — Water pipe burst, CRITICAL

STEP 2 — Open assignment modal
  Admin clicks the complaint row → modal opens
  Shows: Full complaint detail + officer selector dropdown
  Officers shown with: name, active tasks count, ward, department

STEP 3 — Assign
  Admin selects: "Ravi Kumar — WSD — 3 active tasks — WARD-05"
  Clicks: "Assign"

  API Call: PATCH /api/v1/complaints/{id}/assign
  Body: { officerId: RAVI_KUMAR_UUID }
  Backend:
    ComplaintService.assignComplaint(complaintId, officerId, adminId)
    complaint.assignTo(officerId) → status: NEW → ASSIGNED
    assigned_to_id = RAVI_KUMAR_UUID
    Outbox: complaint:status_changed → Redis → (NestJS → SMS to Ravi — future)
    Audit: COMPLAINT_ASSIGNED { assignedToId: RAVI_UUID }

---

## JOURNEY 3: Verifying Resolved Complaints

STEP 1 — Filter complaints by status: VERIFICATION_PENDING
  List shows all complaints where officer has submitted work

STEP 2 — Review completion for CMP-HDMC-202609-0047
  UI shows:
    Resolution Notes: "LED streetlight replaced..."
    Evidence Photo: [Cloudinary image — lit streetlight]
    Resolution GPS: 15.4551, 75.0079
    Distance Deviation: 0.9 meters ✅ (within 50m threshold)
    Rework Count: 0

STEP 3a — VERIFY (approve)
  Admin clicks: "Verify & Close"
  Optional verification notes: "Confirmed via site visit cross-check"
  API Call: PATCH /api/v1/complaints/{id}/verify-close
  Backend:
    Separation of Duties check: verifierId != assignedToId ✅
    complaint.verifyAndClose(notes) → status: VERIFICATION_PENDING → RESOLVED
    resolved_at = NOW
    auto_close_at = NOW + 72 hours (citizen has 72h to contest)
    Outbox: complaint:status_changed
    Audit: COMPLAINT_VERIFIED_RESOLVED

STEP 3b — REQUEST REWORK (reject)
  Admin clicks: "Request Rework"
  Modal: Reason field — REQUIRED
  Admin types: "Photo does not clearly show the drain is repaired. Re-do."
  API Call: PATCH /api/v1/complaints/{id}/request-rework
  Body: { reworkReason: "Photo does not clearly show..." }
  Backend:
    ComplaintService.requestRework(complaintId, verifierId, reason)
    complaint.requestRework(reason, newDeadline) → status: VERIFICATION_PENDING → REWORK_REQUIRED
    rework_count++
    new SLA = NOW + 24 hours
    Outbox: complaint:rework_requested
    IF rework_count >= 2: CRITICAL escalation logged → Dept Head alerted

---

## JOURNEY 4: SLA Breach Management

STEP 1 — SLA Watchdog fires (every 60 seconds)
  Backend scheduler (SlaScheduler.java) checks all active complaints against SLA
  For CMP-HDMC-202609-0031 (drainage, deadline NOW-32h):
    sla_breached = true, escalation_level = 1
    Outbox: sla:breached event

STEP 2 — Admin sees breach alert on dashboard
  🚨 Banner: "7 complaints have breached SLA — immediate attention required"
  Breach table: sorted by overdue time
  Admin can: reassign, escalate manually, add notes

---

## JOURNEY 5: Managing Officers

STEP 1 — Navigate to officers section
  API Call: GET /api/v1/admin/users
  Note: This endpoint returns ALL users for the tenant — no role filter parameter exists.
  AdminController.java lines 38-57: returns List<UserProfileDto> for all users in tenantId.
  Role-based filtering (showing only OFFICERs) is done CLIENT-SIDE in the frontend.
  Each UserProfileDto includes the user's role code for filtering.

STEP 2 — Create officer (PARTIALLY IMPLEMENTED)
  Admin fills: name, phone, email, ward assignment, department, employee code, designation
  API Call: POST /api/v1/admin/users (with role=OFFICER assignment)
  Source: AdminController.java, AuthService.java

STEP 3 — View officer performance
  Per-officer stats: Total assigned, resolved, SLA breached, avg citizen rating

---

## WHAT TENANT ADMIN CAN DO (Full Permissions)
- Full CRUD on complaints within their tenant
- Assign/reassign complaints to any officer
- Verify or request rework on any complaint
- Manage officers and departments
- View all analytics for their municipality
- View audit logs (last 500 entries)
- Issue MLA directives (on behalf of MLA)
- View tenant configuration (SLA hours, locale)
- Deactivate users (soft delete)
- Cannot access other tenants (RLS enforced)

---

# GovOS — Persona 7: Super Admin (GovOS Platform Operator)
## User Journey Documentation

**Portal:** /superadmin/
**Seed user:** admin@govos.in | Tenant: GovOS Platform (Prajna Labs)

---

## WHO IS THIS PERSON?

The Super Admin is Prajna Labs (Cascade Technologies) — the company that built
and operates GovOS. They onboard new municipalities, monitor platform health,
and can see across all tenants.

---

## JOURNEY 1: Cross-Tenant Platform View

STEP 1 — Login (/superadmin/login)
  JWT issued with role: SUPER_ADMIN, tid: PLATFORM_UUID
  (govos_admin DB role — bypasses RLS, sees ALL tenants)

STEP 2 — Platform dashboard (/superadmin/dashboard)
  Stats: Total municipalities onboarded, total complaints platform-wide,
         overall SLA compliance %, active users

STEP 3 — Drill into a specific tenant
  Select: HDMC (Hubballi-Dharwad)
  Views complaints, officers, analytics scoped to HDMC

---

## JOURNEY 2: Onboarding a New Municipality

STEP 1 — Create tenant
  Currently: Done via Flyway seed SQL (no UI yet)
  Future flow: /superadmin/constituencies → Create Tenant form
  Fields: name, code, subdomain, state, locale, SLA hours, logo_url

STEP 2 — Create initial admin user
  POST /api/v1/admin/users with role: TENANT_ADMIN

STEP 3 — Seed constituencies and wards
  Currently: SQL migration per municipality
  Future: Bulk GeoJSON import via admin UI

---

## WHAT SUPER ADMIN CAN DO (Platform-Wide)
- Read ALL data across ALL tenants (RLS bypass via govos_admin DB role)
- Create/deactivate tenants
- Create tenant admin users
- View platform-wide analytics
- Override any complaint status (emergency governance)
- Access full audit logs across all tenants
- Configure global system roles
