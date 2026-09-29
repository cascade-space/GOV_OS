package com.govos.core.domain.outbox;

import java.time.Instant;
import java.util.UUID;

public class OutboxEvent {
    private UUID id;
    private UUID tenantId;
    private String eventType;
    private String aggregateType;
    private UUID aggregateId;
    private String payload;
    private OutboxStatus status;
    private int retryCount;
    private String errorMessage;
    private Instant createdAt;
    private Instant publishedAt;

    public OutboxEvent() {
        this.id = UUID.randomUUID();
        this.status = OutboxStatus.PENDING;
        this.retryCount = 0;
        this.createdAt = Instant.now();
    }

    public OutboxEvent(UUID tenantId, String eventType, String aggregateType, UUID aggregateId, String payload) {
        this.id = UUID.randomUUID();
        this.tenantId = tenantId;
        this.eventType = eventType;
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.status = OutboxStatus.PENDING;
        this.retryCount = 0;
        this.createdAt = Instant.now();
    }

    public void markPublished() {
        this.status = OutboxStatus.PUBLISHED;
        this.publishedAt = Instant.now();
        this.errorMessage = null;
    }

    public void markFailed(String error) {
        this.status = OutboxStatus.FAILED;
        this.retryCount++;
        this.errorMessage = error;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getAggregateType() { return aggregateType; }
    public void setAggregateType(String aggregateType) { this.aggregateType = aggregateType; }

    public UUID getAggregateId() { return aggregateId; }
    public void setAggregateId(UUID aggregateId) { this.aggregateId = aggregateId; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public OutboxStatus getStatus() { return status; }
    public void setStatus(OutboxStatus status) { this.status = status; }

    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
}
