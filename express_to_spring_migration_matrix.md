# Express to Spring Boot Migration Matrix

This matrix inventories the active functionality in the legacy Express backend (`public-landing-page/backend/src/routes`) and maps it to the target Spring Boot (`govos-core-api`) components.

> [!IMPORTANT]
> **Migration Rule**: Migrate one functional area at a time. Do NOT delete the Express code until the Spring Boot equivalent has been fully verified and the frontend integration is switched over.

| Existing Express Function | File | Endpoint | Business Rule | Spring Boot Target | Status |
| --- | --- | --- | --- | --- | --- |
| **Authentication (Admin/Officer)** | `auth.routes.js` | `POST /login` | Authenticates admins against `users` table and returns JWT. | `AuthController.java` | PENDING |
| **Authentication (Citizen OTP Request)** | `auth.routes.js` | `POST /public/otp/request` | Generates Mock OTP (123456). | `AuthController.java` | PENDING |
| **Authentication (Citizen OTP Verify)** | `auth.routes.js` | `POST /otp/verify` | Verifies Mock OTP, registers if new, returns JWT. | `AuthController.java` | PENDING |
| **Check Role** | `auth.routes.js` | `GET /check-role` | Decodes JWT, returns role for frontend RBAC. | `AuthController.java` | PENDING |
| **Create Complaint** | `complaint.routes.js` | `POST /` | File upload handling + DB insert. | `ComplaintController.java` | PENDING |
| **Get My Complaints** | `complaint.routes.js` | `GET /public/my` | Fetches complaints by logged-in citizen `user_id`. | `ComplaintController.java` | PENDING |
| **Track Complaint** | `complaint.routes.js` | `GET /track/:number` | Public tracking via auto-generated `complaintNumber`. | `ComplaintController.java` | PENDING |
| **Get All Complaints** | `complaint.routes.js` | `GET /` | Returns all complaints (Currently lacks tenant filter). | `ComplaintController.java` | PENDING |
| **Get Complaint By ID** | `complaint.routes.js` | `GET /:id` | Returns specific complaint details. | `ComplaintController.java` | PENDING |
| **Update Complaint Status** | `complaint.routes.js` | `PATCH /:id/status` | Updates status (e.g., IN_PROGRESS, RESOLVED). | `ComplaintController.java` | PENDING |
| **Assign Complaint** | `complaint.routes.js` | `PATCH /:id/assign` | Assigns complaint to a specific officer. | `ComplaintController.java` | PENDING |
| **Escalate Complaint** | `complaint.routes.js` | `POST /:id/escalate` | Manual/Automated SLA escalation. | `ComplaintController.java` | PENDING |
| **Add Comment** | `complaint.routes.js` | `POST /:id/comments` | Appends comment to history. | `ComplaintController.java` | PENDING |
| **Dashboard Stats** | `complaint.routes.js` | `GET /stats/dashboard` | Dashboard aggregation metrics. | `AnalyticsController.java` | PENDING |
| **Officer Dashboard** | `officer.routes.js` | `GET /dashboard` | Officer-specific task view. | `OfficerController.java` | PENDING |
| **Officer Login** | `officer.routes.js` | `POST /login` | Officer-specific auth. | `AuthController.java` | PENDING |
| **Create Officer** | `officer.routes.js` | `POST /create` | Admin/MLA creates officer profile. | `OfficerController.java` | PENDING |
| **Get All Officers** | `officer.routes.js` | `GET /` | List all officers. | `OfficerController.java` | PENDING |
| **Update Officer Status** | `officer.routes.js` | `PATCH /:id/status` | Activate/Deactivate officer. | `OfficerController.java` | PENDING |
| **Admin Stats** | `admin.routes.js` | `GET /stats` | High-level Admin Dashboard stats. | `AnalyticsController.java` | PENDING |
| **SuperAdmin Overview** | `superadmin.routes.js` | `GET /overview` | System-wide view. | `SuperAdminController.java` | PENDING |
| **Get Ward Complaints (MLA)** | `mla.routes.js` | `GET /ward/:ward_id/complaints`| Fetch complaints scoped to specific ward. | `WardController.java` | PENDING |
| **File Upload (General)** | `upload.routes.js` | `POST /` | General Cloudinary integration for attachments. | `DocumentController.java` | PENDING |
