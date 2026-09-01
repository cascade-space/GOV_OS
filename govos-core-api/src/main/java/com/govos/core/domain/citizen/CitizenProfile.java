package com.govos.core.domain.citizen;

import java.time.Instant;
import java.util.UUID;

public class CitizenProfile {
    private UUID id;
    private UUID tenantId;
    private UUID userId; // Link to the User Auth entity
    private String fullName;
    private String phoneNumber;
    private String address;
    private UUID wardId;
    private int totalComplaints;
    private Instant createdAt;

    public CitizenProfile() {}

    public CitizenProfile(UUID tenantId, UUID userId, String fullName, String phoneNumber) {
        this.id = UUID.randomUUID();
        this.tenantId = tenantId;
        this.userId = userId;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.totalComplaints = 0;
        this.createdAt = Instant.now();
    }

    public void incrementComplaints() {
        this.totalComplaints++;
    }

    // Getters and Setters omitted for brevity in demo
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public UUID getWardId() { return wardId; }
    public void setWardId(UUID wardId) { this.wardId = wardId; }
    public int getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(int totalComplaints) { this.totalComplaints = totalComplaints; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
