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

        // 5. Publish Event to Redis (NestJS will broadcast to Dashboards)
        eventPublisher.publishComplaintCreated(saved);

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

        eventPublisher.publishComplaintStatusChanged(saved);

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

        eventPublisher.publishComplaintStatusChanged(saved);

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

        eventPublisher.publishComplaintStatusChanged(saved);

        auditService.record(saved.getTenantId(), officerId, "OFFICER",
                "COMPLAINT_WORK_STARTED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"workStartedAt\":\"%s\"}", saved.getWorkStartedAt()));

        log.info("Work started on complaint {} by officer {}", saved.getComplaintNumber(), officerId);
        return saved;
    }

    public Complaint completeWork(UUID complaintId, UUID officerId, String resolutionNotes, String resolutionEvidenceUrl) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        complaint.completeWork(resolutionNotes, resolutionEvidenceUrl);
        Complaint saved = complaintRepository.save(complaint);

        eventPublisher.publishComplaintStatusChanged(saved);

        auditService.record(saved.getTenantId(), officerId, "OFFICER",
                "COMPLAINT_WORK_COMPLETED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"notes\":\"%s\",\"evidenceUrl\":\"%s\"}",
                        resolutionNotes != null ? resolutionNotes.replace("\"", "\\\"") : "",
                        resolutionEvidenceUrl != null ? resolutionEvidenceUrl : ""));

        log.info("Work completed on complaint {} by officer {}. Evidence: {}", saved.getComplaintNumber(), officerId, resolutionEvidenceUrl);
        return saved;
    }

    public Complaint verifyAndClose(UUID complaintId, UUID verifiedByUserId, String notes) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        complaint.verifyAndClose(notes);
        Complaint saved = complaintRepository.save(complaint);

        eventPublisher.publishComplaintStatusChanged(saved);

        auditService.record(saved.getTenantId(), verifiedByUserId, "ADMIN",
                "COMPLAINT_VERIFIED_CLOSED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"verificationNotes\":\"%s\",\"resolvedAt\":\"%s\"}",
                        notes != null ? notes.replace("\"", "\\\"") : "",
                        saved.getResolvedAt()));

        log.info("Complaint {} verified and closed by user {}", saved.getComplaintNumber(), verifiedByUserId);
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
        return complaintRepository.countByTenantIdAndStatus(tenantId, ComplaintStatus.IN_PROGRESS) +
               complaintRepository.countByTenantIdAndStatus(tenantId, ComplaintStatus.ASSIGNED);
    }

    public List<Complaint> listByReporterMobile(String mobile) {
        return complaintRepository.findByReporterMobile(mobile);
    }

    public java.util.Optional<Complaint> findByComplaintNumber(String complaintNumber) {
        return complaintRepository.findByComplaintNumber(complaintNumber);
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

        // 7. Broadcast event so Officers see it in real-time on their dashboards
        eventPublisher.publishComplaintCreated(saved);

        // 8. Audit
        auditService.record(tenantId, systemCitizenId, null,
                "PUBLIC_COMPLAINT_CREATED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"mobile\":\"%s\"}", maskMobile(reporterMobile)));

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
