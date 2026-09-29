# GovOS — Persona 1: Citizen (Unauthenticated / Public)
## User Journey Documentation

**Portal:** Public Landing Page (/) and /citizen/
**Authentication:** NONE required for core flows
**Reference:** Kavitha Nair, 34, resident of Kelgeri Ward, Dharwad

---

## WHO IS THIS PERSON?

Kavitha Nair lives in Kelgeri Ward (WARD-05), Dharwad. She has noticed a broken
streetlight outside her lane for 4 days. She opens GovOS from a WhatsApp link someone
sent her. She has never used the system before. She has no username, no account.

### Persona Profile
| Attribute | Value |
|-----------|-------|
| Tech comfort | Low-Medium (uses WhatsApp daily) |
| Primary language | Kannada (switches to English occasionally) |
| Device | Android smartphone |
| Motivation | Wants the streetlight fixed, not to "file a complaint" |
| Trust level | Skeptical — "will anyone actually act?" |
| Success metric | Streetlight fixed within 48 hours |

---

## JOURNEY 1: Submitting a Complaint

### Context
Kavitha taps a GovOS link. She lands on the public homepage (/).
The page is in Kannada by default (locale kn-IN from HDMC tenant config).

### Step-by-Step Flow

STEP 1 — Land on homepage (/)
  UI Screen: Public landing page — Hero section
  Kavitha sees: "ನಾಗರಿಕ ಸೇವೆ — ನಿಮ್ಮ ದೂರು ದಾಖಲಿಸಿ" (File Your Complaint)
  She sees stat chips: "2,847 ದೂರುಗಳು ಪರಿಹರಿಸಲಾಗಿದೆ" (complaints resolved)
  She clicks: "ದೂರು ದಾಖಲಿಸಿ" button (File a Complaint)
  Navigation: → /citizen/report

STEP 2 — Open complaint form (/citizen/report)
  UI Screen: Complaint submission form
  Form fields she sees:
    - ಹೆಸರು (Name): [text input]
    - ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile): [10-digit input]
    - ಶೀರ್ಷಿಕೆ (Title): [text input]
    - ವಿವರಣೆ (Description): [textarea]
    - ಸ್ಥಳ (Location): [Mapbox map — tap to pin]
    - ಫೋಟೋ ಸೇರಿಸಿ (Add Photo): [Cloudinary upload]
    - ಉಪ-ವಿಭಾಗ (Sub-category): [dropdown]

STEP 3 — Fill the form
  Kavitha types:
    Name: "Kavitha Nair"
    Mobile: "9876543210"
    Title: "Streetlight not working — Kelgeri Lane 4"
    Description: "The streetlight outside House #142, Kelgeri Lane 4 has not worked for 4 days.
                  It is dangerous at night for women and children walking home."
    Location: She taps the map on the Kelgeri Ward area (lat: 15.4550, lng: 75.0078)
    Photo: She uploads a photo of the dark lane from her gallery
    Sub-category: "STREETLIGHT"
  She taps: "ಸಲ್ಲಿಸಿ" (Submit)

STEP 4 — Backend processes the submission
  API Call: POST /api/v1/public/complaints
  Request body: { name, mobile, title, description, latitude, longitude, locationAddress, subCategory }
  
  What happens in the backend (invisible to Kavitha):
    1. ComplaintService.createComplaint() fires
    2. New Complaint domain object created with status = NEW, source = "PUBLIC"
    3. Complaint number generated: CMP-HDMC-202609-0047
    4. AI Service called: POST http://govos-ai:8000/api/classify
       → Gemini 1.5 Flash analyzes title + description
       → Returns: { category: "INFRASTRUCTURE", priority: "MEDIUM", confidence: 0.91 }
    5. SLA deadline computed: NOW + 48 hours (MEDIUM priority)
    6. complaint saved to DB: complaints table (with RLS: tenant_id = HDMC)
    7. Outbox event recorded: { event_type: "complaint:created", status: "PENDING" }
    8. Audit log created: COMPLAINT_CREATED

STEP 5 — Kavitha receives the success response
  UI Screen: Success card overlay
  She sees:
    ✅ "ನಿಮ್ಮ ದೂರು ದಾಖಲಾಗಿದೆ!" (Your complaint has been registered!)
    Complaint Number: CMP-HDMC-202609-0047
    Estimated Resolution: 48 hours
    "ಈ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ — ಸ್ಥಿತಿ ತಿಳಿಯಲು ಬಳಸಿ" (Save this number to track status)
  She screenshots the complaint number.

DB State After Step 5:
  complaints: id=UUID, complaint_number="CMP-HDMC-202609-0047", status="NEW",
              source="PUBLIC", reporter_name="Kavitha Nair", reporter_mobile="9876543210",
              category="INFRASTRUCTURE", priority="MEDIUM",
              sla_deadline=NOW+48h, tenant_id=HDMC_UUID

---

## JOURNEY 2: Tracking a Complaint (Return Visit)

### Context
It's been 24 hours. Kavitha wants to know if anyone has been assigned.
She taps the GovOS link again, types her complaint number.

STEP 1 — Open tracking widget on homepage (/)
  UI Screen: Hero section — track complaint input
  She enters: "CMP-HDMC-202609-0047"
  Taps: "ಶೋಧಿಸಿ" (Search)
  Navigation: → /citizen/track?id=CMP-HDMC-202609-0047

STEP 2 — View tracking result (/citizen/track)
  API Call: GET /api/v1/public/complaints/CMP-HDMC-202609-0047
  Response (safe fields only — no internal officer IDs exposed):
    complaint_number, status, category, priority, location_address,
    created_at, updated_at, title, description,
    resolution_notes, resolution_evidence_url (if resolved),
    citizen_rating, rework_count

  UI shows:
    Status Badge: 🔵 "ASSIGNED" (An officer has been assigned from the PWD Department)
    Category: Infrastructure
    Priority: Medium
    Filed: 2 hours ago
    Last Update: 1 hour ago
    SLA Deadline: 24 hours remaining (progress bar)

  IMPORTANT: Officer name/identity is NOT exposed to the public.
  The PublicTrackResponse DTO (PublicComplaintController.java line 60-80) returns:
    assignedDepartment: "Assigned" (string literal) or "Pending Assignment"
    NO officer name, NO officer contact — PII is protected.

  Kavitha sees: "ಒಬ್ಬ ಅಧಿಕಾರಿ ನಿಯೋಜಿಸಲಾಗಿದೆ" (An officer has been assigned)
  She feels: "OK, someone is looking into it"

---

## JOURNEY 3: Tracking — Complaint Resolved

### Context
30 hours later. Officer has completed work and admin verified it.
Complaint is now RESOLVED.

STEP 1 — Track again
  API Call: GET /api/v1/public/complaints/CMP-HDMC-202609-0047
  Status is now: RESOLVED
  UI shows:
    ✅ Status: RESOLVED
    Resolution Notes: "Streetlight replaced. New LED fitting installed. Tested and operational."
    Evidence Photo: [Cloudinary URL — shows the lit streetlight]
    Resolved At: 29 hours after filing
    Resolution GPS: 15.4551, 75.0079 (0.9m from complaint site — within threshold)
    Auto-closes in: 71 hours 23 minutes

STEP 2 — Confirm or Contest
  UI shows two actions:
    ✅ "ಹೌದು, ಸಮಸ್ಯೆ ಪರಿಹಾರವಾಗಿದೆ" (Yes, issue is resolved) → Rating form
    ❌ "ಇಲ್ಲ, ಇನ್ನೂ ಸರಿಯಿಲ್ಲ" (No, still not fixed) → Reopen form

  Kavitha selects: YES — issue resolved
  Rating form: ⭐⭐⭐⭐ (4 stars)
  Feedback: "Good work, fixed quickly!"

STEP 3 — Submit rating
  API Call: POST /api/v1/public/complaints/{complaintNumber}/confirm
  Body: { mobileNumber: "9876543210", rating: 4, feedback: "Good work, fixed quickly!" }
  NOTE: mobileNumber is REQUIRED — server verifies it matches the original reporter mobile
  DB Update: citizen_rating=4, citizen_feedback="...", status → CLOSED
  Outbox Event: complaint:status_changed (complaint.confirmResolution())

  Source: PublicComplaintController.java line 189 @PostMapping("/complaints/{complaintNumber}/confirm")
          ComplaintService.java line 208: confirmResolution(complaintId, reporterMobile, rating, feedback)

---

## JOURNEY 4: Contesting — Complaint Not Fixed

### Context
Alternate scenario: Kavitha goes back, the streetlight is STILL broken.

STEP 1 — Track and see RESOLVED status (but it's still broken)
STEP 2 — Tap: "ಇಲ್ಲ, ಇನ್ನೂ ಸರಿಯಿಲ್ಲ" (No, still not fixed)
  UI shows: Reopen form
    Mobile Number: [input] — REQUIRED for identity verification
    Reason text: [textarea] — REQUIRED
    Photo evidence: [upload] — MANDATORY (server rejects reopen without photo)

  IMPORTANT: Photo evidence is NOT optional. The backend enforces:
    ComplaintService.java lines 258-260:
      if (newEvidenceUrl == null || newEvidenceUrl.trim().isEmpty()) {
          throw new IllegalArgumentException("Photo evidence is mandatory to reopen an issue.");
      }

STEP 3 — Submit contest
  API Call: POST /api/v1/public/complaints/CMP-HDMC-202609-0047/reopen
  Body: { mobileNumber: "9876543210", reason: "Still not working.", evidenceUrl: "https://..." }

  What happens in backend:
    1. Mobile number verified against complaint.reporterMobile (security check):
       ComplaintService.java lines 245-253: throws SecurityException if mobile doesn't match
    2. 72h window validation:
       ComplaintService.java lines 263-267: throws IllegalStateException if > 72h since resolved
    3. complaint.reopenByCitizen(reason, evidenceUrl)
       status → REOPENED
       priority bumped → HIGH (24h SLA)
       rework_count++ (tracked in complaints.rework_count column)
       sla_deadline = NOW + 24 hours
    4. Outbox event: complaint:status_changed
    5. Audit: COMPLAINT_REOPENED_BY_CITIZEN

  Source: ComplaintService.java line 241 reopenByCitizen()
          Complaint.java line 204 reopenByCitizen(reason, reopenEvidenceUrl)

  UI shows: "ನಿಮ್ಮ ದೂರು ಮರು-ತೆರೆಯಲಾಗಿದೆ — ಇದನ್ನು ಆದ್ಯತೆಯಾಗಿ ಗಣಿಸಲಾಗುತ್ತದೆ"
  (Your complaint has been reopened and will be treated with priority)

---

## WHAT KAVITHA CANNOT DO (Permissions Boundary)
- She CANNOT see the officer's name or contact details
- She CANNOT directly reassign the complaint
- She CANNOT see internal audit logs or escalation levels
- She CANNOT directly contact the admin — all communication is through status + feedback
- She CANNOT delete or modify her complaint after submission

---

## MULTI-LANGUAGE EXPERIENCE
- HDMC tenant locale: kn-IN (Kannada default)
- Language switcher: EN / ಕನ್ನಡ toggle in navbar
- All form labels, status messages, error texts translated
- Complaint number format stays in Latin numerals (universal)
