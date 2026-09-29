# GovOS — Persona 3: Field Officer
## User Journey Documentation

**Portal:** /officer/
**Authentication:** JWT (email + OTP login)
**Reference:** Rajesh Sharma, Junior Engineer, Public Works Dept (PWD), Colaba/Kelgeri Ward
**Seed user:** officer@demo.govos.in | Employee Code: EMP-001

---

## WHO IS THIS PERSON?

Rajesh Sharma is a Junior Engineer at the Public Works Department. He is assigned to
Kelgeri Ward (WARD-05). Every morning he opens GovOS on his phone to see his task list.
He goes into the field, fixes issues, takes photos as proof, and submits his work.

### Persona Profile
| Attribute | Value |
|-----------|-------|
| Tech comfort | Medium (uses smartphone for field work) |
| Primary language | Kannada + English (bilingual) |
| Device | Android (field), Desktop (office reports) |
| Motivation | Clear task list, no ambiguous assignments |
| Pain point | Getting blamed for things not in his ward/scope |
| Success metric | Task closed with evidence before SLA deadline |

---

## JOURNEY 1: Morning Login and Task Overview

STEP 1 — Open portal and login (/officer/login)
  UI Screen: Officer login page — phone + OTP
  Rajesh enters: "+919777777777"
  API Call: POST /api/v1/auth/otp/send { identifier: "+919777777777", type: "LOGIN" }
  OTP stored in Redis with TTL (mock: logged to console in dev)
  He enters OTP: 123456 (dev mock master OTP)
  API Call: POST /api/v1/auth/otp/verify { identifier, otp }
  Response: { accessToken (15min JWT), refreshToken (7-day) }
  JWT Claims: { sub: OFFICER_UUID, tid: HDMC_UUID, rid: "OFFICER", wid: "WARD-05_UUID" }
  Navigation: → /officer/dashboard

STEP 2 — Dashboard overview (/officer/dashboard)
  API Call: GET /api/v1/complaints/assigned/me
  Request Header: Authorization: Bearer {JWT}
  Backend: Extracts officerId from JWT, queries complaints WHERE assigned_to_id = officerId
  RLS automatically filters: WHERE tenant_id = HDMC_UUID (via SET LOCAL app.tenant_id)

  Source: ComplaintController.java lines 135-144
    @GetMapping("/assigned/me")
    @PreAuthorize("hasAnyAuthority('ROLE_OFFICER', 'ROLE_TENANT_ADMIN', 'ROLE_SUPER_ADMIN')")

  UI shows:
    Stat cards:
      🔴 SLA Breached: 1
      🟡 Active Tasks: 4
      ✅ Completed Today: 2
      ⭐ Avg Rating: 4.2

    Task list with SLA countdown:
      CMP-HDMC-202609-0047 | Streetlight | MEDIUM | 23:14 remaining | [NEW]
      CMP-HDMC-202609-0039 | Pothole | HIGH   | 06:42 remaining | [IN_PROGRESS] 🔴
      CMP-HDMC-202609-0031 | Drainage | HIGH   | OVERDUE 02:13   | [ASSIGNED] 🚨
      CMP-HDMC-202609-0028 | Water Pipe | CRITICAL | 03:21 remaining | [IN_PROGRESS]

    Mapbox map showing task pins color-coded by urgency

---

## JOURNEY 2: Starting Work on a Complaint

### Context
Rajesh selects CMP-HDMC-202609-0047 (the Kavitha streetlight case).
He's physically at the site.

STEP 1 — Open task detail (/officer/tasks/CMP-HDMC-202609-0047)
  UI shows full complaint:
    Title: "Streetlight not working — Kelgeri Lane 4"
    Description: "...dangerous at night for women and children..."
    Category: INFRASTRUCTURE | Sub-category: STREETLIGHT
    Priority: MEDIUM | SLA: 23h 14m remaining
    Filed by: Kavitha Nair | Mobile: +91987654**** (partially masked)
    Location: Map pin at Kelgeri Lane 4
    Evidence photo (citizen's): [dark lane photo]
    MLA Directive: NONE

STEP 2 — Tap "Start Work"
  UI: "Start Work" button
  API Call: PATCH /api/v1/complaints/{id}/start-work
  Header: Authorization: Bearer {JWT}
  Backend:
    ComplaintService.startWork(complaintId, officerId)
    IMPORTANT: If the complaint was assigned but assignedToId is null,
      the system auto-assigns this officer (ComplaintService.java lines 100-102):
        if (complaint.getAssignedToId() == null && officerId != null)
            complaint.setAssignedToId(officerId)
    complaint.startWork() → status: ASSIGNED → IN_PROGRESS
    work_started_at = NOW
    Outbox event: complaint:status_changed
    Audit: COMPLAINT_WORK_STARTED { workStartedAt: "2026-09-15T07:34:00Z" }
  UI feedback: Status badge changes to 🔵 IN_PROGRESS

  Source: ComplaintController.java line 80:
    @PatchMapping("/{id}/start-work")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")

---

## JOURNEY 3: Completing Work with Evidence

### Context
Rajesh has replaced the streetlight. He is still at the site (GPS active).
He opens the task on his phone.

STEP 1 — Tap "Complete Work"
  UI: Modal opens — "Work Completion Report"
  Fields:
    Resolution Notes: [textarea] Required
    Evidence Photos: [Cloudinary upload] — up to 3 photos
    Location: [Auto-captured from device GPS — Mapbox]
    Share my current GPS for verification: [checkbox — checked by default]

STEP 2 — Fill completion report
  Rajesh types:
    Notes: "LED streetlight replaced. New 40W LED fitting installed on Pole #14.
            Tested — light is operational. Old fitting disposed per PWD protocol."
  He uploads 2 photos (lit streetlight from two angles)
  GPS: 15.4551, 75.0079 (auto-captured, 0.9m from complaint pin)

STEP 3 — Submit completion
  API Call: POST /api/v1/complaints/{id}/complete-work
  Body: {
    resolutionNotes: "LED streetlight replaced...",
    resolutionEvidenceUrl: "https://res.cloudinary.com/govos/image/upload/v1/...",
    resolutionLatitude: 15.4551,
    resolutionLongitude: 75.0079
  }

  Backend:
    ComplaintService.completeWork(id, officerId, notes, evidenceUrl, resLat, resLng)
    complaint.completeWork(notes, evidenceUrl, 15.4551, 75.0079)
      status: IN_PROGRESS → VERIFICATION_PENDING
      resolution_notes = "LED streetlight replaced..."
      resolution_evidence_url = "https://..."
      resolution_latitude = 15.4551, resolution_longitude = 75.0079
      distance_deviation_meters = calculateDistanceMeters(15.4550, 75.0078, 15.4551, 75.0079)
                                 = 0.9 meters  ✅ (within 50m threshold)
      work_completed_at = NOW
    Outbox event: complaint:status_changed
    Audit: COMPLAINT_WORK_COMPLETED { notes, evidenceUrl, distanceDeviation: 0.9 }

  UI feedback: 
    ✅ "Work submitted for verification!"
    Status: VERIFICATION_PENDING
    Task moves to "Submitted" section of dashboard

---

## JOURNEY 4: Handling a Rework Request

### Context
Admin reviewed Rajesh's work on a different complaint (CMP-HDMC-202609-0031 — drainage)
and sent it back: the photo doesn't show the actual drain, and notes are incomplete.

STEP 1 — Notification arrives
  (Designed: real-time WebSocket notification — currently not wired)
  (Dev fallback: Rajesh sees it on next dashboard refresh)
  
  UI shows: 🔴 REWORK badge on CMP-HDMC-202609-0031
  Status: REWORK_REQUIRED

STEP 2 — Open task detail
  UI shows rework section:
    Rework Reason: "Photo does not show the drain clearly. Evidence is insufficient.
                    Please re-submit with a photo showing the drain cover replaced."
    Rework Count: 1 of 3
    New SLA Deadline: 24 hours from now

STEP 3 — Go back to site and re-do
  Rajesh returns to the drain site, fixes properly, takes better photos

STEP 4 — Re-submit completion
  API Call: POST /api/v1/complaints/{id}/complete-work (same endpoint, new evidence)
  Backend:
    complaint.completeWork(newNotes, newEvidenceUrl, resLat, resLng)
    status: REWORK_REQUIRED → VERIFICATION_PENDING
    rework_count stays at 1 (incremented on rework request, not re-submit)
  Outbox event: complaint:status_changed

  NOTE: If rework_count >= 2, system auto-logs escalation to DEPT_HEAD:
    "CRITICAL: Complaint CMP-... has failed verification 2 times! Alerting Department Head."

---

## JOURNEY 5: Viewing Task History

STEP 1 — Navigate to /officer/history
  API Call: GET /api/v1/complaints (filtered to assigned/completed by this officer)
  UI: Table showing all completed tasks
    Columns: Complaint#, Title, Category, Completed Date, Rating, Resolution Time
    Filters: Date range, Category, Rating

---

## WHAT RAJESH CANNOT DO (Permissions Boundary)
- He CANNOT verify or close his OWN complaint (separation of duties — enforced in service layer)
- He CANNOT assign complaints to other officers
- He CANNOT see complaints assigned to other officers
- He CANNOT view analytics dashboards beyond his own stats
- He CANNOT issue MLA directives
- He CANNOT modify a complaint's category or priority
- He CANNOT access any other tenant's data (RLS enforcement)
- He CANNOT delete evidence or notes after submission

---

## SEPARATION OF DUTIES (Critical Design Rule)

From ComplaintService.java line 149-152:
  // Strict Separation of Duties check
  if (complaint.getAssignedToId() != null && complaint.getAssignedToId().equals(verifiedByUserId)) {
      throw new SecurityException("The assigned field officer cannot verify or close their own work.");
  }

This means: Rajesh can NEVER verify the work he himself submitted.
This is a core governance guarantee — verification must always come from a different person.
