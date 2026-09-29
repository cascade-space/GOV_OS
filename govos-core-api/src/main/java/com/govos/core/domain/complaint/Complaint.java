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

    // Milestone M5 Verification, Rework & Citizen Confirmation fields
    private String reworkReason;
    private int reworkCount = 0;
    private Integer citizenRating;
    private String citizenFeedback;
    private Double resolutionLatitude;
    private Double resolutionLongitude;
    private Double distanceDeviationMeters;
    private Instant autoCloseAt;

    // SLA & Escalation fields
    private Instant slaDeadline;
    private boolean slaBreached;
    private boolean slaWarningSent;
    private int escalationLevel;

    // Milestone M8 External Integration Hub fields
    private String externalSystem;
    private String externalTicketId;
    private String integrationStatus = "NONE";
    private Instant externalSyncedAt;
    private String lastExternalStatus;

    // Milestone M9 Civic Assets & Projects
    private UUID assetId;
    private UUID projectId;
    
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

        this.slaBreached = false;
        this.slaWarningSent = false;
        this.escalationLevel = 0;
        this.computeAndSetSlaDeadline();
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
        this.computeAndSetSlaDeadline();
        this.updatedAt = Instant.now();
    }

    public void computeAndSetSlaDeadline() {
        if (this.priority == null) {
            this.priority = Priority.MEDIUM;
        }
        long hours = switch (this.priority) {
            case CRITICAL -> 12L;
            case HIGH -> 24L;
            case MEDIUM -> 48L;
            case LOW -> 72L;
        };
        Instant baseTime = this.createdAt != null ? this.createdAt : Instant.now();
        this.slaDeadline = baseTime.plus(java.time.Duration.ofHours(hours));
    }

    public void markSlaWarning() {
        this.slaWarningSent = true;
        this.updatedAt = Instant.now();
    }

    public void markSlaBreached() {
        this.slaBreached = true;
        this.escalationLevel = 1;
        this.updatedAt = Instant.now();
    }

    public void escalateToLevel2() {
        this.escalationLevel = 2;
        this.priority = Priority.CRITICAL;
        this.updatedAt = Instant.now();
    }

    public void autoClose() {
        this.status = ComplaintStatus.CLOSED;
        this.citizenFeedback = "Automatically closed following 72h resolution window expiration without citizen contest.";
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
        completeWork(notes, evidenceUrl, null, null);
    }

    public void completeWork(String notes, String evidenceUrl, Double resLat, Double resLng) {
        this.status = ComplaintStatus.VERIFICATION_PENDING;
        this.resolutionNotes = notes;
        this.resolutionEvidenceUrl = evidenceUrl;
        this.resolutionLatitude = resLat;
        this.resolutionLongitude = resLng;
        this.distanceDeviationMeters = calculateDistanceMeters(this.latitude, this.longitude, resLat, resLng);
        this.workCompletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void requestRework(String reason, Instant newSlaDeadline) {
        this.status = ComplaintStatus.REWORK_REQUIRED;
        this.reworkReason = reason;
        this.reworkCount++;
        this.slaDeadline = newSlaDeadline;
        this.updatedAt = Instant.now();
    }

    public void verifyAndClose(String notes) {
        this.status = ComplaintStatus.RESOLVED;
        if (notes != null && !notes.isBlank()) {
            this.resolutionNotes = (this.resolutionNotes != null ? this.resolutionNotes + " | Verification: " : "") + notes;
        }
        this.resolvedAt = Instant.now();
        this.autoCloseAt = Instant.now().plus(java.time.Duration.ofHours(72));
        this.updatedAt = Instant.now();
    }

    public void confirmResolution(int rating, String feedback) {
        this.status = ComplaintStatus.CLOSED;
        this.citizenRating = rating;
        this.citizenFeedback = feedback;
        this.updatedAt = Instant.now();
    }

    public void reopenByCitizen(String reason, String reopenEvidenceUrl) {
        this.status = ComplaintStatus.REOPENED;
        this.citizenFeedback = reason;
        if (reopenEvidenceUrl != null && !reopenEvidenceUrl.isBlank()) {
            this.resolutionEvidenceUrl = reopenEvidenceUrl;
        }
        this.reworkReason = "Citizen contested: " + reason;
        this.reworkCount++;
        this.priority = Priority.HIGH;
        this.slaDeadline = Instant.now().plus(java.time.Duration.ofHours(24));
        this.updatedAt = Instant.now();
    }
    
    public void updateStatus(ComplaintStatus newStatus) {
        this.status = newStatus;
        if (newStatus == ComplaintStatus.IN_PROGRESS && this.workStartedAt == null) {
            this.workStartedAt = Instant.now();
        } else if ((newStatus == ComplaintStatus.WORK_COMPLETED || newStatus == ComplaintStatus.VERIFICATION_PENDING) && this.workCompletedAt == null) {
            this.workCompletedAt = Instant.now();
        } else if (newStatus == ComplaintStatus.RESOLVED) {
            if (this.resolvedAt == null) this.resolvedAt = Instant.now();
            if (this.autoCloseAt == null) this.autoCloseAt = Instant.now().plus(java.time.Duration.ofHours(72));
        } else if (newStatus == ComplaintStatus.CLOSED && this.resolvedAt == null) {
            this.resolvedAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    private Double calculateDistanceMeters(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
        final int R = 6371000;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
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
    public Instant getSlaDeadline() { return slaDeadline; }
    public boolean isSlaBreached() { return slaBreached; }
    public boolean isSlaWarningSent() { return slaWarningSent; }
    public int getEscalationLevel() { return escalationLevel; }
    public String getReworkReason() { return reworkReason; }
    public int getReworkCount() { return reworkCount; }
    public Integer getCitizenRating() { return citizenRating; }
    public String getCitizenFeedback() { return citizenFeedback; }
    public Double getResolutionLatitude() { return resolutionLatitude; }
    public Double getResolutionLongitude() { return resolutionLongitude; }
    public Double getDistanceDeviationMeters() { return distanceDeviationMeters; }
    public Instant getAutoCloseAt() { return autoCloseAt; }

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
    public void setReworkReason(String reworkReason) { this.reworkReason = reworkReason; }
    public void setReworkCount(int reworkCount) { this.reworkCount = reworkCount; }
    public void setCitizenRating(Integer citizenRating) { this.citizenRating = citizenRating; }
    public void setCitizenFeedback(String citizenFeedback) { this.citizenFeedback = citizenFeedback; }
    public void setResolutionLatitude(Double resolutionLatitude) { this.resolutionLatitude = resolutionLatitude; }
    public void setResolutionLongitude(Double resolutionLongitude) { this.resolutionLongitude = resolutionLongitude; }
    public void setDistanceDeviationMeters(Double distanceDeviationMeters) { this.distanceDeviationMeters = distanceDeviationMeters; }
    public void setAutoCloseAt(Instant autoCloseAt) { this.autoCloseAt = autoCloseAt; }
    public void setWorkStartedAt(Instant workStartedAt) { this.workStartedAt = workStartedAt; }
    public void setWorkCompletedAt(Instant workCompletedAt) { this.workCompletedAt = workCompletedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public void setSlaDeadline(Instant slaDeadline) { this.slaDeadline = slaDeadline; }
    public void setSlaBreached(boolean slaBreached) { this.slaBreached = slaBreached; }
    public void setSlaWarningSent(boolean slaWarningSent) { this.slaWarningSent = slaWarningSent; }
    public void setEscalationLevel(int escalationLevel) { this.escalationLevel = escalationLevel; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public String getExternalSystem() { return externalSystem; }
    public void setExternalSystem(String externalSystem) { this.externalSystem = externalSystem; }

    public String getExternalTicketId() { return externalTicketId; }
    public void setExternalTicketId(String externalTicketId) { this.externalTicketId = externalTicketId; }

    public String getIntegrationStatus() { return integrationStatus; }
    public void setIntegrationStatus(String integrationStatus) { this.integrationStatus = integrationStatus; }

    public Instant getExternalSyncedAt() { return externalSyncedAt; }
    public void setExternalSyncedAt(Instant externalSyncedAt) { this.externalSyncedAt = externalSyncedAt; }

    public String getLastExternalStatus() { return lastExternalStatus; }
    public void setLastExternalStatus(String lastExternalStatus) { this.lastExternalStatus = lastExternalStatus; }

    public void markExternalSyncSuccess(String externalSystem, String externalTicketId, String externalStatus) {
        this.externalSystem = externalSystem;
        this.externalTicketId = externalTicketId;
        this.integrationStatus = "SYNCED";
        this.externalSyncedAt = Instant.now();
        this.lastExternalStatus = externalStatus;
        this.updatedAt = Instant.now();
    }

    public void markExternalSyncFailed(String externalSystem, String error) {
        this.externalSystem = externalSystem;
        this.integrationStatus = "FAILED";
        this.lastExternalStatus = "ERROR: " + error;
        this.updatedAt = Instant.now();
    }

    public UUID getAssetId() { return assetId; }
    public void setAssetId(UUID assetId) { this.assetId = assetId; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
}
