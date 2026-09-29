package com.govos.core.application.complaint;

import com.govos.core.application.admin.AuditService;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.complaint.ComplaintStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AiClassificationClient aiClient;
    private final EventPublisher eventPublisher;
    private final AuditService auditService;
    private final com.govos.core.application.outbox.OutboxService outboxService;

    public Complaint createComplaint(UUID tenantId, UUID reporterId, String title, String description, Double lat, Double lng) {
        // 1. Create Domain Entity
        Complaint complaint = new Complaint(tenantId, reporterId, title, description, lat, lng);

        // 2. Generate Number
        String cNumber = complaintRepository.generateNextComplaintNumber(tenantId);
        complaint.setComplaintNumber(cNumber);

        // 3. Call AI Service (FastAPI) for categorization and ward assignment
        try {
            var aiResult = aiClient.classifyComplaint(title, description, lat, lng);
            complaint.applyAiClassification(aiResult.category(), aiResult.priority(), aiResult.suggestedWard());
        } catch (Exception e) {
            log.error("AI Classification failed for complaint {}: {}", cNumber, e.getMessage());
            // Fallback to manual assignment queue if AI fails
            complaint.applyAiClassification("General", com.govos.core.domain.complaint.Priority.MEDIUM, null);
        }

        // 4. Save to Database
        Complaint saved = complaintRepository.save(complaint);

        // 5. Transactionally record Outbox Event (guaranteed delivery to Redis & WebSockets)
        outboxService.recordEvent(saved.getTenantId(), "complaint:created", "COMPLAINT", saved.getId(), saved);

        // 6. Record audit event
        auditService.record(tenantId, reporterId, null,
                "COMPLAINT_CREATED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(), null);

        return saved;
    }

    public Complaint updateStatus(UUID complaintId, ComplaintStatus newStatus) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found"));

        ComplaintStatus prevStatus = complaint.getStatus();
        complaint.updateStatus(newStatus);
        Complaint saved = complaintRepository.save(complaint);

        // Send SMS to citizen when complaint is resolved (tailored for initial vs rework completion)
        if (newStatus == ComplaintStatus.RESOLVED && saved.getReporterMobile() != null && !saved.getReporterMobile().isBlank()) {
            String trackingUrl = "http://localhost:3000/citizen/track?id=" + saved.getComplaintNumber();
            String smsBody;
            if (saved.getReworkCount() > 0) {
                smsBody = String.format("GovOS: Rework for your grievance %s has been completed and verified by supervisor. Inspect the updated work proof and submit your final review: %s",
                        saved.getComplaintNumber(), trackingUrl);
                log.info("[CITIZEN REWORK RESOLUTION SMS DISPATCHED] To: {} | Message: {}", saved.getReporterMobile(), smsBody);
            } else {
                smsBody = String.format("GovOS: Your grievance %s has been marked RESOLVED by the field team. Inspect the work and confirm or reopen within 72 hours: %s",
                        saved.getComplaintNumber(), trackingUrl);
                log.info("[CITIZEN RESOLUTION SMS DISPATCHED] To: {} | Message: {}", saved.getReporterMobile(), smsBody);
            }

            Map<String, String> smsPayload = Map.of(
                    "to", saved.getReporterMobile(),
                    "body", smsBody,
                    "complaintNumber", saved.getComplaintNumber(),
                    "trackingUrl", trackingUrl,
                    "reworkCount", String.valueOf(saved.getReworkCount())
            );
            outboxService.recordEvent(saved.getTenantId(), "sms:sent", "SMS", saved.getId(), smsPayload);
        }

        outboxService.recordEvent(saved.getTenantId(), "complaint:status_changed", "COMPLAINT", saved.getId(), saved);

        // Record audit event with status transition payload
        auditService.record(saved.getTenantId(), null, "SYSTEM",
                "COMPLAINT_STATUS_CHANGED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"from\":\"%s\",\"to\":\"%s\"}", prevStatus, newStatus));

        return saved;
    }

    public Complaint assignComplaint(UUID complaintId, UUID officerId, UUID assignedByUserId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        complaint.assignTo(officerId);
        Complaint saved = complaintRepository.save(complaint);

        outboxService.recordEvent(saved.getTenantId(), "complaint:status_changed", "COMPLAINT", saved.getId(), saved);

        auditService.record(saved.getTenantId(), assignedByUserId, "ADMIN",
                "COMPLAINT_ASSIGNED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"assignedToId\":\"%s\"}", officerId));

        log.info("Complaint {} assigned to officer {}", saved.getComplaintNumber(), officerId);
        return saved;
    }

    public Complaint startWork(UUID complaintId, UUID officerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        if (complaint.getAssignedToId() == null && officerId != null) {
            complaint.setAssignedToId(officerId);
        }

        complaint.startWork();
        Complaint saved = complaintRepository.save(complaint);

        outboxService.recordEvent(saved.getTenantId(), "complaint:status_changed", "COMPLAINT", saved.getId(), saved);

        auditService.record(saved.getTenantId(), officerId, "OFFICER",
                "COMPLAINT_WORK_STARTED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"workStartedAt\":\"%s\"}", saved.getWorkStartedAt()));

        log.info("Work started on complaint {} by officer {}", saved.getComplaintNumber(), officerId);
        return saved;
    }

    public Complaint completeWork(UUID complaintId, UUID officerId, String resolutionNotes, String resolutionEvidenceUrl) {
        return completeWork(complaintId, officerId, resolutionNotes, resolutionEvidenceUrl, null, null);
    }

    public Complaint completeWork(UUID complaintId, UUID officerId, String resolutionNotes, String resolutionEvidenceUrl, Double resLat, Double resLng) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        complaint.completeWork(resolutionNotes, resolutionEvidenceUrl, resLat, resLng);
        Complaint saved = complaintRepository.save(complaint);

        outboxService.recordEvent(saved.getTenantId(), "complaint:status_changed", "COMPLAINT", saved.getId(), saved);

        auditService.record(saved.getTenantId(), officerId, "OFFICER",
                "COMPLAINT_WORK_COMPLETED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"notes\":\"%s\",\"evidenceUrl\":\"%s\",\"distanceDeviation\":%s}",
                        resolutionNotes != null ? resolutionNotes.replace("\"", "\\\"") : "",
                        resolutionEvidenceUrl != null ? resolutionEvidenceUrl : "",
                        saved.getDistanceDeviationMeters()));

        log.info("Work completed on complaint {} by officer {}. Evidence: {}, Status: {}",
                saved.getComplaintNumber(), officerId, resolutionEvidenceUrl, saved.getStatus());
        return saved;
    }

    public Complaint verifyAndClose(UUID complaintId, UUID verifiedByUserId, String notes) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        // Strict Separation of Duties check
        if (complaint.getAssignedToId() != null && complaint.getAssignedToId().equals(verifiedByUserId)) {
            log.warn("Separation of duties violation: Officer {} attempted to verify own complaint {}", verifiedByUserId, complaint.getComplaintNumber());
            throw new SecurityException("Separation of duties violation: The assigned field officer cannot verify or close their own work.");
        }

        complaint.verifyAndClose(notes);
        Complaint saved = complaintRepository.save(complaint);

        // Auto-send SMS to citizen with tracking link to inspect work (tailored for initial vs rework completion)
        if (saved.getReporterMobile() != null && !saved.getReporterMobile().isBlank()) {
            String trackingUrl = "http://localhost:3000/citizen/track?id=" + saved.getComplaintNumber();
            String smsBody;
            if (saved.getReworkCount() > 0) {
                smsBody = String.format("GovOS: Rework for your grievance %s has been completed and verified by supervisor. Inspect the updated work proof and submit your final review: %s",
                        saved.getComplaintNumber(), trackingUrl);
                log.info("[CITIZEN REWORK RESOLUTION SMS DISPATCHED] To: {} | Message: {}", saved.getReporterMobile(), smsBody);
            } else {
                smsBody = String.format("GovOS: Your grievance %s has been marked RESOLVED by the field team. Inspect the work and confirm or reopen within 72 hours: %s",
                        saved.getComplaintNumber(), trackingUrl);
                log.info("[CITIZEN RESOLUTION SMS DISPATCHED] To: {} | Message: {}", saved.getReporterMobile(), smsBody);
            }

            Map<String, String> smsPayload = Map.of(
                    "to", saved.getReporterMobile(),
                    "body", smsBody,
                    "complaintNumber", saved.getComplaintNumber(),
                    "trackingUrl", trackingUrl,
                    "reworkCount", String.valueOf(saved.getReworkCount())
            );
            outboxService.recordEvent(saved.getTenantId(), "sms:sent", "SMS", saved.getId(), smsPayload);
        }

        outboxService.recordEvent(saved.getTenantId(), "complaint:status_changed", "COMPLAINT", saved.getId(), saved);

        auditService.record(saved.getTenantId(), verifiedByUserId, "ADMIN",
                "COMPLAINT_VERIFIED_RESOLVED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"verificationNotes\":\"%s\",\"resolvedAt\":\"%s\",\"autoCloseAt\":\"%s\"}",
                        notes != null ? notes.replace("\"", "\\\"") : "",
                        saved.getResolvedAt(),
                        saved.getAutoCloseAt()));

        log.info("Complaint {} verified and resolved by user {}", saved.getComplaintNumber(), verifiedByUserId);
        return saved;
    }

    public Complaint requestRework(UUID complaintId, UUID verifierId, String reworkReason) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        if (reworkReason == null || reworkReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rework reason is mandatory when rejecting completed work.");
        }

        // Extend SLA by 24 hours
        java.time.Instant newDeadline = java.time.Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS);
        complaint.requestRework(reworkReason, newDeadline);

        Complaint saved = complaintRepository.save(complaint);

        // Escalation check if rework count >= 2
        if (saved.getReworkCount() >= 2) {
            log.warn("CRITICAL: Complaint {} has failed verification {} times! Alerting Department Head.",
                    saved.getComplaintNumber(), saved.getReworkCount());
            auditService.record(saved.getTenantId(), verifierId, "QC_VERIFIER",
                    "COMPLAINT_REPEAT_FAILURE_ESCALATION", "COMPLAINT", saved.getId().toString(),
                    saved.getComplaintNumber(),
                    String.format("{\"reworkCount\":%d,\"reason\":\"%s\"}",
                            saved.getReworkCount(), reworkReason.replace("\"", "\\\"")));
        }

        outboxService.recordEvent(saved.getTenantId(), "complaint:rework_requested", "COMPLAINT", saved.getId(), saved);

        auditService.record(saved.getTenantId(), verifierId, "QC_VERIFIER",
                "COMPLAINT_REWORK_REQUESTED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"reworkReason\":\"%s\",\"newSlaDeadline\":\"%s\",\"reworkCount\":%d}",
                        reworkReason.replace("\"", "\\\""), newDeadline, saved.getReworkCount()));

        // Dispatch Citizen Rework Notification SMS
        if (saved.getReporterMobile() != null && !saved.getReporterMobile().isBlank()) {
            String trackingUrl = "http://localhost:3000/citizen/track?id=" + saved.getComplaintNumber();
            String smsBody = String.format("GovOS: Corrective rework has been initiated for your grievance %s. A field team has been re-dispatched. Track progress here: %s",
                    saved.getComplaintNumber(), trackingUrl);
            log.info("[CITIZEN REWORK INITIATED SMS DISPATCHED] To: {} | Message: {}", saved.getReporterMobile(), smsBody);

            Map<String, String> smsPayload = Map.of(
                    "to", saved.getReporterMobile(),
                    "body", smsBody,
                    "complaintNumber", saved.getComplaintNumber(),
                    "trackingUrl", trackingUrl,
                    "reworkCount", String.valueOf(saved.getReworkCount())
            );
            outboxService.recordEvent(saved.getTenantId(), "sms:sent", "SMS", saved.getId(), smsPayload);
        }

        log.info("Rework requested for complaint {} by verifier {}. Count: {}", saved.getComplaintNumber(), verifierId, saved.getReworkCount());
        return saved;
    }

    public Complaint confirmResolution(UUID complaintId, String reporterMobile, int rating, String feedback) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        if (complaint.getReporterMobile() != null && reporterMobile != null) {
            String cleanDb = complaint.getReporterMobile().replaceAll("[^0-9]", "");
            String cleanReq = reporterMobile.replaceAll("[^0-9]", "");
            if (cleanDb.length() >= 10 && cleanReq.length() >= 10) {
                if (!cleanDb.endsWith(cleanReq.substring(cleanReq.length() - 10))) {
                    throw new SecurityException("Unauthorized: Mobile number does not match complaint reporter.");
                }
            }
        }

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars.");
        }

        complaint.confirmResolution(rating, feedback);
        Complaint saved = complaintRepository.save(complaint);

        outboxService.recordEvent(saved.getTenantId(), "complaint:status_changed", "COMPLAINT", saved.getId(), saved);

        auditService.record(saved.getTenantId(), null, "CITIZEN",
                "COMPLAINT_CITIZEN_CONFIRMED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"rating\":%d,\"feedback\":\"%s\"}",
                        rating, feedback != null ? feedback.replace("\"", "\\\"") : ""));

        log.info("Complaint {} confirmed by citizen with rating {}/5", saved.getComplaintNumber(), rating);

        // Dispatch Citizen Review Acknowledgment SMS
        if (saved.getReporterMobile() != null && !saved.getReporterMobile().isBlank()) {
            String trackingUrl = "http://localhost:3000/citizen/track?id=" + saved.getComplaintNumber();
            String smsBody = String.format("GovOS: Thank you for your feedback on grievance %s. Your review (%d/5 stars) has been recorded and the grievance is now closed. View summary: %s",
                    saved.getComplaintNumber(), rating, trackingUrl);
            log.info("[CITIZEN REVIEW ACKNOWLEDGMENT SMS DISPATCHED] To: {} | Message: {}", saved.getReporterMobile(), smsBody);

            Map<String, String> smsPayload = Map.of(
                    "to", saved.getReporterMobile(),
                    "body", smsBody,
                    "complaintNumber", saved.getComplaintNumber(),
                    "trackingUrl", trackingUrl,
                    "rating", String.valueOf(rating)
            );
            outboxService.recordEvent(saved.getTenantId(), "sms:sent", "SMS", saved.getId(), smsPayload);
        }

        return saved;
    }

    public Complaint reopenByCitizen(UUID complaintId, String reporterMobile, String reason, String newEvidenceUrl) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        if (complaint.getReporterMobile() != null && reporterMobile != null) {
            String cleanDb = complaint.getReporterMobile().replaceAll("[^0-9]", "");
            String cleanReq = reporterMobile.replaceAll("[^0-9]", "");
            if (cleanDb.length() >= 10 && cleanReq.length() >= 10) {
                if (!cleanDb.endsWith(cleanReq.substring(cleanReq.length() - 10))) {
                    throw new SecurityException("Unauthorized: Mobile number does not match complaint reporter.");
                }
            }
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Contest reason is mandatory to reopen an issue.");
        }
        if (newEvidenceUrl == null || newEvidenceUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Photo evidence is mandatory to reopen an issue.");
        }

        // Validate 72-hour window
        if (complaint.getResolvedAt() != null) {
            long hoursSinceResolved = java.time.Duration.between(complaint.getResolvedAt(), java.time.Instant.now()).toHours();
            if (hoursSinceResolved > 72) {
                throw new IllegalStateException("72-hour contest window has expired for this complaint.");
            }
        }

        complaint.reopenByCitizen(reason, newEvidenceUrl);
        // Keep assignedToId so the rework task stays visible in the officer's dashboard.
        // The officer who completed the work is expected to address the rework.
        // Admin can re-assign from the admin panel if needed.
        Complaint saved = complaintRepository.save(complaint);

        outboxService.recordEvent(saved.getTenantId(), "complaint:status_changed", "COMPLAINT", saved.getId(), saved);

        auditService.record(saved.getTenantId(), null, "CITIZEN",
                "COMPLAINT_REOPENED_BY_CITIZEN", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"reason\":\"%s\",\"evidenceUrl\":\"%s\"}",
                        reason.replace("\"", "\\\""), newEvidenceUrl));

        // Dispatch Citizen Rework Notification SMS
        if (saved.getReporterMobile() != null && !saved.getReporterMobile().isBlank()) {
            String trackingUrl = "http://localhost:3000/citizen/track?id=" + saved.getComplaintNumber();
            String smsBody = String.format("GovOS: Your contest and rework request for grievance %s has been registered. Field team notified. Track progress: %s",
                    saved.getComplaintNumber(), trackingUrl);
            log.info("[CITIZEN REOPEN REWORK SMS DISPATCHED] To: {} | Message: {}", saved.getReporterMobile(), smsBody);

            Map<String, String> smsPayload = Map.of(
                    "to", saved.getReporterMobile(),
                    "body", smsBody,
                    "complaintNumber", saved.getComplaintNumber(),
                    "trackingUrl", trackingUrl,
                    "reworkCount", String.valueOf(saved.getReworkCount())
            );
            outboxService.recordEvent(saved.getTenantId(), "sms:sent", "SMS", saved.getId(), smsPayload);
        }

        log.info("Complaint {} reopened by citizen with reason: {}. Re-queued for Admin assignment.", saved.getComplaintNumber(), reason);
        return saved;
    }

    public List<Complaint> listAssignedToOfficer(UUID tenantId, UUID officerId) {
        if (tenantId != null) {
            return complaintRepository.findByTenantIdAndAssignedToId(tenantId, officerId);
        }
        return complaintRepository.findByAssignedToId(officerId);
    }

    public List<Complaint> listByTenant(UUID tenantId) {
        return complaintRepository.findByTenantId(tenantId);
    }

    public long countTotalByTenant(UUID tenantId) {
        return complaintRepository.countByTenantId(tenantId);
    }

    public long countResolvedByTenant(UUID tenantId) {
        return complaintRepository.countResolvedByTenantId(tenantId);
    }

    public long countInProgressByTenant(UUID tenantId) {
        return complaintRepository.countByTenantIdAndStatus(tenantId, ComplaintStatus.IN_PROGRESS);
    }

    public List<Complaint> listByReporterMobile(String mobile) {
        return complaintRepository.findByReporterMobile(mobile);
    }

    public List<Complaint> listByConstituency(UUID tenantId, String constituency) {
        return complaintRepository.findByTenantIdAndConstituency(tenantId, constituency);
    }

    public List<Complaint> listByReporterId(UUID reporterId) {
        return complaintRepository.findByReporterId(reporterId);
    }

    public List<Complaint> listByWard(UUID tenantId, UUID wardId) {
        return complaintRepository.findByTenantIdAndWardId(tenantId, wardId);
    }

    public java.util.Optional<Complaint> findByComplaintNumber(String complaintNumber) {
        return complaintRepository.findByComplaintNumber(complaintNumber);
    }

    public java.util.Optional<Complaint> findById(UUID id) {
        return complaintRepository.findById(id);
    }

    /**
     * Creates a complaint submitted from the public citizen portal.
     * No user account or JWT required — citizen identified by mobile number only.
     * Tenant is resolved from GPS; falls back to the first active tenant in the DB.
     */
    public Complaint createPublicComplaint(String reporterName, String reporterMobile,
                                           String title, String description,
                                           Double lat, Double lng,
                                           String locationAddress, String subCategory) {
        // 1. Resolve tenant from GPS — use the default dev tenant as a sentinel UUID
        //    In production, call AI geo-service; for now we use the seeded tenant.
        UUID tenantId = resolveDefaultTenant();

        // 2. Use a fixed "PUBLIC_CITIZEN" system user id as reporter
        //    This avoids requiring a real user record for anonymous citizens
        UUID systemCitizenId = java.util.UUID.fromString("00000000-0000-0000-0000-000000000001");

        // 3. Create domain entity
        Complaint complaint = new Complaint(tenantId, systemCitizenId, title, description, lat, lng);
        complaint.setReporterName(reporterName);
        complaint.setReporterMobile(reporterMobile);
        complaint.setSource("PUBLIC");
        complaint.setSubCategory(subCategory);
        complaint.setLocationAddress(locationAddress);

        // 4. Generate unique complaint number
        String cNumber = complaintRepository.generateNextComplaintNumber(tenantId);
        complaint.setComplaintNumber(cNumber);

        // 5. AI Classification — same pipeline as internal complaints
        try {
            var aiResult = aiClient.classifyComplaint(title, description, lat, lng);
            complaint.applyAiClassification(aiResult.category(), aiResult.priority(), aiResult.suggestedWard());
        } catch (Exception e) {
            log.error("AI Classification failed for public complaint {}: {}", cNumber, e.getMessage());
            complaint.applyAiClassification("General", com.govos.core.domain.complaint.Priority.MEDIUM, null);
        }

        // 6. Save
        Complaint saved = complaintRepository.save(complaint);

        // 7. Transactionally record Outbox Event so Officers and Citizens receive live updates
        outboxService.recordEvent(saved.getTenantId(), "complaint:created", "COMPLAINT", saved.getId(), saved);

        // 8. Audit
        auditService.record(tenantId, systemCitizenId, null,
                "PUBLIC_COMPLAINT_CREATED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"mobile\":\"%s\"}", maskMobile(reporterMobile)));

        // 9. Dispatch Citizen SMS Notification with direct tracking link
        if (reporterMobile != null && !reporterMobile.isBlank()) {
            String trackingUrl = "http://localhost:3000/citizen/track?id=" + saved.getComplaintNumber();
            String smsBody = String.format("GovOS: Your grievance %s has been registered. Track live status here: %s",
                    saved.getComplaintNumber(), trackingUrl);
            log.info("[CITIZEN REGISTRATION SMS DISPATCHED] To: {} | Message: {}", reporterMobile, smsBody);

            Map<String, String> smsPayload = Map.of(
                    "to", reporterMobile,
                    "body", smsBody,
                    "complaintNumber", saved.getComplaintNumber(),
                    "trackingUrl", trackingUrl
            );
            outboxService.recordEvent(saved.getTenantId(), "sms:sent", "SMS", saved.getId(), smsPayload);
        }

        log.info("Public complaint {} created for mobile={}", cNumber, maskMobile(reporterMobile));
        return saved;
    }

    private UUID resolveDefaultTenant() {
        // Seeded default tenant in V5__seed_data.sql
        return java.util.UUID.fromString("00000000-0000-0000-0000-000000000002");
    }

    private String maskMobile(String mobile) {
        if (mobile == null || mobile.length() < 4) return "****";
        return "******" + mobile.substring(mobile.length() - 4);
    }
}
