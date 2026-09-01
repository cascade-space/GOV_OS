package com.govos.core.domain.map;

import java.util.UUID;

public class GeoFeature {
    private UUID id;
    private UUID tenantId;
    private String type; // COMPLAINT, ASSET, PROJECT
    private String title;
    private Double latitude;
    private Double longitude;
    private String severity; // HIGH, MEDIUM, LOW

    public GeoFeature() {}

    public GeoFeature(UUID tenantId, String type, String title, Double latitude, Double longitude, String severity) {
        this.id = UUID.randomUUID();
        this.tenantId = tenantId;
        this.type = type;
        this.title = title;
        this.latitude = latitude;
        this.longitude = longitude;
        this.severity = severity;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
}
