# GovOS — Complaint Lifecycle Thread
## End-to-End Journey Across All Roles

**The central narrative of GovOS: One complaint, all roles, one thread.**

Reference: CMP-HDMC-202609-0047 — Streetlight, Kelgeri Ward, Dharwad

---

## TIMELINE VIEW

`
DAY 0, 08:15 AM  — CITIZEN submits complaint (PUBLIC portal, no account)
DAY 0, 08:15 AM  — AI classifies: INFRASTRUCTURE / MEDIUM / 0.91 confidence
DAY 0, 08:15 AM  — SLA deadline set: DAY 2, 08:15 AM (48h MEDIUM SLA)
DAY 0, 08:15 AM  — outbox_events: complaint:created → Redis (→ future SMS to ward officers)

DAY 0, 09:02 AM  — ADMIN sees new complaint in assignment queue
DAY 0, 09:04 AM  — ADMIN assigns to Officer Rajesh Sharma (PWD, Ward-05)
                   status: NEW → ASSIGNED
                   outbox: complaint:status_changed

DAY 1, 07:34 AM  — OFFICER Rajesh starts work (physically at site)
                   status: ASSIGNED → IN_PROGRESS
                   work_started_at recorded

DAY 1, 10:12 AM  — OFFICER Rajesh completes work
                   LED replaced, 2 photos uploaded to Cloudinary
                   GPS: 15.4551, 75.0079 — deviation: 0.9m ✅
                   status: IN_PROGRESS → VERIFICATION_PENDING

DAY 1, 11:30 AM  — SLA check (at 75% of 48h = 36h): NO warning yet (only 27h elapsed)

DAY 1, 02:15 PM  — ADMIN reviews verification queue
                   Views evidence photo — streetlight is lit ✅
                   Views GPS deviation: 0.9m ✅ (within 50m threshold)
                   Clicks: "Verify & Close"
                   status: VERIFICATION_PENDING → RESOLVED
                   resolved_at recorded, auto_close_at = resolved_at + 72h
                   outbox: complaint:status_changed

DAY 1, 02:15 PM  — CITIZEN sees RESOLVED when she tracks (citizenaction window opens)

DAY 1, 02:20 PM  — MLA Amrut Desai's staff monitors dashboard
                   This complaint shows RESOLVED ✅
                   No directive needed — resolved within SLA

DAY 4, 02:15 PM  — 72h window expires with NO citizen contest
                   SlaScheduler fires: autoClose()
                   status: RESOLVED → CLOSED
                   outbox: sla:auto_close
                   Audit: COMPLAINT_AUTO_CLOSED

FINAL STATE: CLOSED | Total time: ~30 hours | Citizen rating: 4⭐
`

---

## ALTERNATE TIMELINE: SLA BREACH + MLA DIRECTIVE

`
DAY 0, 08:15 AM  — Different complaint: CMP-HDMC-202609-0039, POTHOLE, HIGH, Gandhinagar
DAY 0, 09:00 AM  — ADMIN assigns to Officer Ravi Kumar
                   status: NEW → ASSIGNED (SLA: 24h)

DAY 1, 09:00 AM  — SLA WATCHDOG fires (24h elapsed — DEADLINE HIT)
                   sla_breached = true, escalation_level = 1
                   outbox: sla:breached
                   Audit: SLA_BREACHED
                   (SMS to admin + dept head — future)

DAY 1, 06:00 PM  — Officer Ravi starts work (9h late)
                   status: ASSIGNED → IN_PROGRESS

DAY 2, 09:00 AM  — SLA WATCHDOG: 24h past breach, escalation_level = 1
                   Condition: sla_breached AND escalation_level == 1 AND now > deadline + 24h
                   → escalateToLevel2()
                   escalation_level = 2, priority → CRITICAL
                   outbox: sla:level2_escalation
                   (SMS to MLA / Commissioner — future)

DAY 2, 11:00 AM  — MLA Amrut Desai sees CRITICAL alert on dashboard
                   7 SLA-breached, 1 now Level-2 escalated
                   He reviews: Pothole at Gandhinagar, CRITICAL, 2 accidents reported

DAY 2, 11:15 AM  — MLA ISSUES DIRECTIVE
                   Type: PRIORITY_ESCALATION
                   Notes: "Immediate repair mandated. Commissioner informed."
                   mla_directives table: new record, status: ACTIVE

DAY 2, 11:16 AM  — ADMIN sees active directive on their dashboard
                   Escalates internally, deploys additional repair team

DAY 2, 03:30 PM  — Officer Ravi completes pothole repair (with additional help)
                   status: IN_PROGRESS → VERIFICATION_PENDING

DAY 2, 04:00 PM  — ADMIN verifies (different admin, separation of duties)
                   status: VERIFICATION_PENDING → RESOLVED

DAY 2, 04:01 PM  — MLA directive auto-updates: complaint now RESOLVED
                   Directive status: stays ACTIVE until admin manually marks COMPLETED

DAY 5, 04:00 PM  — 72h window expires, auto-close fires
                   FINAL STATE: CLOSED | MLA Directive: COMPLETED
`

---

## REWORK CYCLE DETAILED

`
After Officer submits completion → Admin reviews:

ADMIN DECISION: NOT ACCEPTABLE
  Reason: "Photo does not show drain is cleared. Only shows feet next to drain."

  ComplaintService.requestRework():
    status: VERIFICATION_PENDING → REWORK_REQUIRED
    rework_reason = "Photo does not show..."
    rework_count++ (now 1)
    new SLA = NOW + 24h
    outbox: complaint:rework_requested

OFFICER receives rework notice:
  Task appears with 🔴 REWORK badge
  Sees reason from admin
  Returns to site, clears drain properly, takes clear photo
  Re-submits via POST /api/v1/complaints/{id}/complete-work

ADMIN reviews again:
  Better photo ✅ — verifies and closes

IF rework_count reaches 2:
  System logs CRITICAL alert: "Complaint has failed verification 2 times"
  Dept Head is alerted (audit record: COMPLAINT_REPEAT_FAILURE_ESCALATION)
  Complaint escalation level may be bumped
`

---

## COMPLETE STATUS TRANSITION MAP

`
                  ┌─────────────────────────────────────────────────────────────────┐
                  │                    COMPLAINT STATUS FLOW                         │
                  └─────────────────────────────────────────────────────────────────┘

  [PUBLIC/OFFICER submit]
         │
         ▼
       NEW ──────────────────── Admin assigns ──────────────────────► ASSIGNED
                                                                          │
                                                                    Officer starts
                                                                          │
                                                                          ▼
                                                                    IN_PROGRESS
                                                                          │
                                                                    Officer completes
                                                                          │
                                                                          ▼
                                                               VERIFICATION_PENDING
                                                                    │         │
                                                             Admin verifies  Admin rejects
                                                                    │         │
                                                                    ▼         ▼
                                                                RESOLVED  REWORK_REQUIRED
                                                                    │         │
                                                            Citizen 72h   Officer re-does
                                                            window          │
                                                                │           ▼
                                                        ┌───────┴───┐  IN_PROGRESS
                                                        │           │  (repeat cycle)
                                                  Citizen    Citizen
                                                  confirms   contests
                                                        │           │
                                                        ▼           ▼
                                                     CLOSED      REOPENED ──► IN_PROGRESS
                                                                           (priority: HIGH,
                                                                            24h SLA)
  Special statuses:
    DUPLICATE — Admin marks as duplicate of existing complaint (no auto-detection currently)
    WORK_COMPLETED — exists as intermediate status between IN_PROGRESS and VERIFICATION_PENDING
                     (used internally; maps to VERIFICATION_PENDING via updateStatus logic)

  Source: ComplaintStatus.java — 10 values:
    NEW, ASSIGNED, IN_PROGRESS, WORK_COMPLETED, VERIFICATION_PENDING,
    REWORK_REQUIRED, RESOLVED, CLOSED, REOPENED, DUPLICATE
  NOTE: CANCELLED does NOT exist as a status in the codebase.
`

---

## EVENT STREAM MAPPING (Outbox Events)

| Event | Triggered By | Consumer Target | DB Change |
|-------|-------------|-----------------|-----------|
| complaint:created | Public/Officer submit | SMS to ward officers (future) | complaints row inserted |
| complaint:status_changed | assign/start/complete/verify/rework/reopen/confirm | WebSocket to citizen | complaints.status updated |
| complaint:rework_requested | Admin rejects work | SMS to officer (future) | rework_count++, status change |
| sla:warning | SLA watchdog (75% elapsed) | SMS to officer (future) | sla_warning_sent=true |
| sla:breach | SLA watchdog (100%, deadline hit) | SMS to admin (future) | sla_breached=true, escalation_level=1 |
| sla:escalated | SLA watchdog (L1 hours past breach) | SMS to MLA/Commissioner (future) | escalation_level=2, priority→CRITICAL |
| complaint:status_changed (CLOSED) | SLA watchdog (resolved+72h) | Citizen notification (future) | status→CLOSED |

Source: SlaScheduler.java outboxService.recordEvent() calls:
  line 83: "sla:escalated"
  line 101: "sla:breach"
  line 126: "sla:warning"
  line 153: "complaint:status_changed" (auto-close)
  ComplaintService.java: "complaint:created", "complaint:status_changed", "complaint:rework_requested"
