package com.govos.core.domain.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLog {
    private UUID id;
    private UUID tenantId;
    private String action;
    private String user;
    private String resourceType;
    private String resourceId;
    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(UUID tenantId, String action, String user, String resourceType, String resourceId, LocalDateTime timestamp) {
        this.id = UUID.randomUUID();
        this.tenantId = tenantId;
        this.action = action;
        this.user = user;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.timestamp = timestamp;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
