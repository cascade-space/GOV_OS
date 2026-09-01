package com.govos.core.domain.officer;

import java.util.UUID;

public class OfficerProfile {
    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private String fullName;
    private String department;
    private String designation;
    private UUID assignedWardId;
    private int currentWorkload; // Active complaints
    private boolean isAvailable;
    
    public OfficerProfile() {}

    public OfficerProfile(UUID tenantId, UUID userId, String fullName, String department, String designation) {
        this.id = UUID.randomUUID();
        this.tenantId = tenantId;
        this.userId = userId;
        this.fullName = fullName;
        this.department = department;
        this.designation = designation;
        this.currentWorkload = 0;
        this.isAvailable = true;
    }

    public void incrementWorkload() {
        this.currentWorkload++;
    }

    public void decrementWorkload() {
        if (this.currentWorkload > 0) {
            this.currentWorkload--;
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public UUID getAssignedWardId() { return assignedWardId; }
    public void setAssignedWardId(UUID assignedWardId) { this.assignedWardId = assignedWardId; }
    public int getCurrentWorkload() { return currentWorkload; }
    public void setCurrentWorkload(int currentWorkload) { this.currentWorkload = currentWorkload; }
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
