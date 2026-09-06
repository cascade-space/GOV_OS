package com.govos.core.domain.directive;

import java.time.Instant;
import java.util.UUID;

public class MlaDirective {
    private UUID id;
    private UUID tenantId;
    private UUID complaintId;
    private String mlaName;
    private String constituency;
    private String directiveType; // EXPEDITE_RESOLUTION, URGENT_INQUIRY, CITIZEN_REPRESENTATION
    private String instructionNotes;
    private String status; // ACTIVE, ACKNOWLEDGED, RESOLVED
    private Instant createdAt;
    private Instant updatedAt;
    private boolean isDeleted;

    public MlaDirective(UUID tenantId, UUID complaintId, String mlaName, String constituency,
                        String directiveType, String instructionNotes) {
        this.id = UUID.randomUUID();
        this.tenantId = tenantId;
        this.complaintId = complaintId;
        this.mlaName = mlaName;
        this.constituency = constituency;
        this.directiveType = directiveType;
        this.instructionNotes = instructionNotes;
        this.status = "ACTIVE";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.isDeleted = false;
    }

    public MlaDirective() {}

    public void acknowledge() {
        this.status = "ACKNOWLEDGED";
        this.updatedAt = Instant.now();
    }

    public void resolve() {
        this.status = "RESOLVED";
        this.updatedAt = Instant.now();
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getComplaintId() { return complaintId; }
    public String getMlaName() { return mlaName; }
    public String getConstituency() { return constituency; }
    public String getDirectiveType() { return directiveType; }
    public String getInstructionNotes() { return instructionNotes; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public boolean isDeleted() { return isDeleted; }

    // Setters
    public void setId(UUID id) { this.id = id; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public void setComplaintId(UUID complaintId) { this.complaintId = complaintId; }
    public void setMlaName(String mlaName) { this.mlaName = mlaName; }
    public void setConstituency(String constituency) { this.constituency = constituency; }
    public void setDirectiveType(String directiveType) { this.directiveType = directiveType; }
    public void setInstructionNotes(String instructionNotes) { this.instructionNotes = instructionNotes; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
}
