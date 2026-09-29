# GovOS — User Journey Documentation
## MASTER INDEX + PROJECT User Philosophy

**Reference Municipality:** Hubballi-Dharwad Municipal Corporation (HDMC), Karnataka
**Constituency:** Dharwad #71 | MLA: Amrut Desai
**Wards:** Saptapur, Kalyan Nagar, Line Bazaar, Gandhinagar, Kelgeri, Hosayellapur, Navalur, Sadhankeri

---

## DOCUMENT INDEX

| File | Persona | Key Workflows |
|------|---------|---------------|
| 01_Citizen_Unauthenticated.md | Citizen (no account) | Submit complaint, track status |
| 02_Citizen_Registered.md | Citizen (OTP login) | Dashboard, rating, reopen |
| 03_Field_Officer.md | Field Officer | Receive tasks, execute, upload evidence |
| 04_Department_Head.md | Department Head | Verify work, manage officers, analytics |
| 05_MLA_Representative.md | MLA / Elected Rep | Monitor constituency, issue directives |
| 06_Tenant_Admin.md | Tenant Admin (Municipality) | Full governance management |
| 07_Super_Admin.md | GovOS Super Admin | Platform operations, multi-tenant |
| 08_Complaint_Lifecycle_Thread.md | All Roles | End-to-end complaint lifecycle |
| 09_Codebase_Mind_Map.md | Dev Reference | Domain-to-file-to-layer map |

---

## PROJECT USER PHILOSOPHY

### The Core Belief
GovOS is built on a single philosophical conviction:

  "Governance accountability is only possible when every action is visible,
   every complaint is traceable, and every resolution is verifiable."

This philosophy shapes how users interact with the system:

### 1. The Citizen is the Source of Truth
- Citizens don't need accounts to file complaints — removing friction maximizes participation
- The complaint number (CMP-HDMC-202609-0024) is the citizen's receipt — immutable proof they were heard
- Citizens get the final word on whether their complaint is truly resolved (72h confirmation window)
- If a citizen says "no, this is NOT fixed" — the system forces a rework cycle

### 2. The Officer is Accountable, Not Just Assigned
- Officers cannot self-verify their own work (separation of duties enforced in code)
- GPS distance deviation is calculated — an officer cannot claim to have fixed something
  500 meters from the actual complaint site
- Every action (start, complete, rework) is timestamped and immutable in audit_logs
- SLA breach is not punitive — it is a signal for institutional support and escalation

### 3. The Admin is the Operational Governor
- Admins do not do the work — they enable, verify, and oversee
- Assignment is a deliberate act (not just automatic AI routing) — admin owns allocation
- Verification is a formal QC step — admin explicitly signs off on resolutions
- If verification fails twice, the system auto-escalates to Department Head

### 4. The MLA is the Democratic Override
- Any complaint can be elevated to a political directive by an MLA
- Directives are binding — they signal constituency-level urgency
- MLA visibility into complaint data is read-only governance — not operational interference
- The system provides the MLA with data, not power to close/reopen (that remains with Admin)

### 5. The Super Admin is the Platform Steward
- Super Admin is Prajna Labs / Cascade Technologies — the platform operator
- Super Admin can see across ALL tenants (HDMC, Mumbai, Bengaluru, etc.)
- Multi-tenant isolation means no municipality's data leaks to another
- Super Admin provisions municipalities — they do not operate them

---

## COMPLAINT NUMBER ANATOMY

  CMP - HDMC - 202609 - 0024
   |     |       |        |
   |     |       |        +--- Sequential number within tenant+month
   |     |       +------------ Year + Month (YYYYMM)
   |     +-------------------- Tenant code (HDMC = Hubballi-Dharwad Municipal Corp)
   +--------------------------- Fixed prefix "CMP" for Complaint

---

## THE SLA FRAMEWORK (Dharwad Config)

| Priority | SLA Window | Who Sets It | Example |
|----------|-----------|-------------|---------|
| CRITICAL | 12 hours | AI (physical danger) | Open manhole, live wire |
| HIGH | 24 hours | AI (area-wide impact) | Pipeline burst |
| MEDIUM | 48 hours | AI (standard) | Broken streetlight |
| LOW | 72 hours | AI (minor) | Paint on road |

At 75% of window -> Warning event fired -> Officer notified
At 100% of window -> SLA breach -> Escalation Level 1 -> Admin + Dept Head alerted
After escalation_l1_hours past breach (policy-driven, NOT a fixed 24h):
  CRITICAL complaints: L2 triggers 6h after breach
  HIGH complaints:     L2 triggers 12h after breach
  MEDIUM complaints:   L2 triggers 24h after breach
  LOW complaints:      L2 triggers 24h after breach
  -> Priority bumped to CRITICAL -> MLA/Municipal Commissioner alerted
At 72h post-RESOLVED (no citizen contest) -> Auto-close

Source: V17__m7_sla_watchdog_and_policies.sql (escalation_level_1_hours per priority)
        SlaScheduler.java line 78: deadline.plus(Duration.ofHours(target.escalationL1Hours()))

---

## ROLE PERMISSION MATRIX

> **IMPORTANT — Implemented Roles:** Only the following roles are implemented as Spring Security
> authorities in the codebase: SUPER_ADMIN, TENANT_ADMIN, OFFICER, REP.
> DEPT_HEAD is described in project philosophy but is NOT an active Spring Security role.
> DEPT_HEAD operations are handled by TENANT_ADMIN in the current implementation.

| Action | Citizen | Officer | Admin (TENANT_ADMIN) | MLA (REP) | SuperAdmin |
|--------|---------|---------|---------------------|-----------|------------|
| Submit complaint (public) | YES | YES | YES | YES | YES |
| Track by complaint number | YES | YES | YES | YES | YES |
| Login (OTP) | YES | YES | YES | YES | YES |
| View assigned tasks | - | OWN ONLY | TENANT-WIDE | - | ALL |
| Start work on complaint | - | YES | YES | - | YES |
| Complete work + evidence | - | YES | YES | - | YES |
| Assign complaint to officer | - | - | YES | - | YES |
| Verify resolved complaint | - | - | YES (not own work)* | - | YES |
| Request rework | - | - | YES | - | YES |
| Issue MLA directive via API | - | - | YES (on behalf of MLA) | NO** | YES |
| View analytics dashboard | - | - | TENANT-WIDE | CONST (planned) | ALL |
| Manage officers | - | - | TENANT-WIDE | - | ALL |
| Manage departments | - | - | TENANT-WIDE | - | YES |
| Manage tenants | - | - | - | - | YES |
| View audit logs | - | - | TENANT-WIDE | - | ALL |

*Cannot verify OWN assigned complaint — SecurityException thrown in ComplaintService.verifyAndClose()
**REP role is NOT authorized on POST /api/v1/mla/directives — TENANT_ADMIN issues directives
  on behalf of MLA. REP-role self-service directive issuance is planned but not implemented.

Source: ComplaintController.java @PreAuthorize annotations, MlaDirectiveController.java line 24
