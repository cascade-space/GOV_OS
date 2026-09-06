package com.govos.core.domain.complaint;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain Aggregate Root representing a Civic Complaint.
 * Free of JPA/Spring annotations to comply with Hexagonal Architecture.
 */
public class Complaint {
    private UUID id;
    private String complaintNumber; // CMP-{TENANT}-{YYYYMM}-{SEQ}
    private UUID tenantId;
    private UUID reporterId;
    private String title;
    private String description;
    
    private String category;
    private Priority priority;
    private ComplaintStatus status;
    
    private Double latitude;
    private Double longitude;
    private UUID wardId;
    
    private UUID assignedToId;
    private Instant aiAssessedAt;

    // Public portal fields
    private String reporterName;     // citizen's name (no account needed)
    private String reporterMobile;   // citizen's phone for tracking
    private String source;           // "INTERNAL" or "PUBLIC"
    private String subCategory;
    private String locationAddress;
    
    // Officer task execution & resolution fields
    private String resolutionNotes;
    private String resolutionEvidenceUrl;
    private Instant workStartedAt;
    private Instant workCompletedAt;
    private Instant resolvedAt;
    
    private Instant createdAt;
    private Instant updatedAt;
    private boolean isDeleted;

    // Constructors, Getters, and Setters omitted for brevity in builder pattern
    
    public Complaint(UUID tenantId, UUID reporterId, String title, String description, Double latitude, Double longitude) {
        this.id = UUID.randomUUID();
        this.tenantId = tenantId;
        this.reporterId = reporterId;
        this.title = title;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        
        this.status = ComplaintStatus.NEW;
        this.priority = Priority.LOW; // Default before AI
        this.source = "INTERNAL";
        
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.isDeleted = false;
    }

    // Required for ORM mappers
    public Complaint() {}

    public void applyAiClassification(String category, Priority priority, UUID suggestedWard) {
        this.category = category;
        this.priority = priority;
        if (suggestedWard != null) {
            this.wardId = suggestedWard;
        }
        this.aiAssessedAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public void assignTo(UUID officerId) {
        this.assignedToId = officerId;
        this.status = ComplaintStatus.ASSIGNED;
        this.updatedAt = Instant.now();
    }

    public void startWork() {
        this.status = ComplaintStatus.IN_PROGRESS;
        if (this.workStartedAt == null) {
            this.workStartedAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    public void completeWork(String notes, String evidenceUrl) {
        this.status = ComplaintStatus.WORK_COMPLETED;
        this.resolutionNotes = notes;
        this.resolutionEvidenceUrl = evidenceUrl;
        this.workCompletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void verifyAndClose(String notes) {
        this.status = ComplaintStatus.RESOLVED;
        if (notes != null && !notes.isBlank()) {
            this.resolutionNotes = (this.resolutionNotes != null ? this.resolutionNotes + " | Verification: " : "") + notes;
        }
        this.resolvedAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public void updateStatus(ComplaintStatus newStatus) {
        this.status = newStatus;
        if (newStatus == ComplaintStatus.IN_PROGRESS && this.workStartedAt == null) {
            this.workStartedAt = Instant.now();
        } else if (newStatus == ComplaintStatus.WORK_COMPLETED && this.workCompletedAt == null) {
            this.workCompletedAt = Instant.now();
        } else if ((newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) && this.resolvedAt == null) {
            this.resolvedAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    public void setComplaintNumber(String complaintNumber) {
        this.complaintNumber = complaintNumber;
    }

    // Getters
    public UUID getId() { return id; }
    public String getComplaintNumber() { return complaintNumber; }
    public UUID getTenantId() { return tenantId; }
    public UUID getReporterId() { return reporterId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public Priority getPriority() { return priority; }
    public ComplaintStatus getStatus() { return status; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public UUID getWardId() { return wardId; }
    public UUID getAssignedToId() { return assignedToId; }
    public Instant getAiAssessedAt() { return aiAssessedAt; }
    public String getReporterName() { return reporterName; }
    public String getReporterMobile() { return reporterMobile; }
    public String getSource() { return source; }
    public String getSubCategory() { return subCategory; }
    public String getLocationAddress() { return locationAddress; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public boolean isDeleted() { return isDeleted; }

    public String getResolutionNotes() { return resolutionNotes; }
    public String getResolutionEvidenceUrl() { return resolutionEvidenceUrl; }
    public Instant getWorkStartedAt() { return workStartedAt; }
    public Instant getWorkCompletedAt() { return workCompletedAt; }
    public Instant getResolvedAt() { return resolvedAt; }

    // Setters for mappers
    public void setId(UUID id) { this.id = id; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public void setReporterId(UUID reporterId) { this.reporterId = reporterId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(String category) { this.category = category; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setWardId(UUID wardId) { this.wardId = wardId; }
    public void setAssignedToId(UUID assignedToId) { this.assignedToId = assignedToId; }
    public void setAiAssessedAt(Instant aiAssessedAt) { this.aiAssessedAt = aiAssessedAt; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }
    public void setReporterMobile(String reporterMobile) { this.reporterMobile = reporterMobile; }
    public void setSource(String source) { this.source = source; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public void setResolutionEvidenceUrl(String resolutionEvidenceUrl) { this.resolutionEvidenceUrl = resolutionEvidenceUrl; }
    public void setWorkStartedAt(Instant workStartedAt) { this.workStartedAt = workStartedAt; }
    public void setWorkCompletedAt(Instant workCompletedAt) { this.workCompletedAt = workCompletedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
}
