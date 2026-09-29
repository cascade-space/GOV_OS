package com.govos.core.infrastructure.persistence.outbox;

import com.govos.core.domain.outbox.OutboxEvent;
import com.govos.core.domain.outbox.OutboxStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events")
@Getter
@Setter
@NoArgsConstructor
public class JpaOutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "aggregate_type", nullable = false, length = 50)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false)
    private UUID aggregateId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OutboxStatus status = OutboxStatus.PENDING;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "published_at")
    private Instant publishedAt;

    public OutboxEvent toDomain() {
        OutboxEvent event = new OutboxEvent();
        event.setId(this.id);
        event.setTenantId(this.tenantId);
        event.setEventType(this.eventType);
        event.setAggregateType(this.aggregateType);
        event.setAggregateId(this.aggregateId);
        event.setPayload(this.payload);
        event.setStatus(this.status);
        event.setRetryCount(this.retryCount);
        event.setErrorMessage(this.errorMessage);
        event.setCreatedAt(this.createdAt);
        event.setPublishedAt(this.publishedAt);
        return event;
    }

    public static JpaOutboxEvent fromDomain(OutboxEvent domain) {
        JpaOutboxEvent entity = new JpaOutboxEvent();
        entity.setId(domain.getId());
        entity.setTenantId(domain.getTenantId());
        entity.setEventType(domain.getEventType());
        entity.setAggregateType(domain.getAggregateType());
        entity.setAggregateId(domain.getAggregateId());
        entity.setPayload(domain.getPayload());
        entity.setStatus(domain.getStatus());
        entity.setRetryCount(domain.getRetryCount());
        entity.setErrorMessage(domain.getErrorMessage());
        entity.setCreatedAt(domain.getCreatedAt() != null ? domain.getCreatedAt() : Instant.now());
        entity.setPublishedAt(domain.getPublishedAt());
        return entity;
    }
}
