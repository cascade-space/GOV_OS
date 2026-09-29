package com.govos.core.infrastructure.persistence.integration;

import com.govos.core.domain.integration.IntegrationDirection;
import com.govos.core.domain.integration.IntegrationSyncRecord;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "integration_sync_records")
@Getter
@Setter
@NoArgsConstructor
public class JpaIntegrationSyncRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "complaint_id", nullable = false)
    private UUID complaintId;

    @Column(name = "external_system", nullable = false, length = 50)
    private String externalSystem;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 10)
    private IntegrationDirection direction;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "external_ticket_id", length = 100)
    private String externalTicketId;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // PENDING, SUCCESS, FAILED

    @Column(name = "http_status")
    private Integer httpStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "request_payload", columnDefinition = "jsonb")
    private String requestPayload;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_payload", columnDefinition = "jsonb")
    private String responsePayload;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "correlation_id", length = 100)
    private String correlationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public IntegrationSyncRecord toDomain() {
        return IntegrationSyncRecord.builder()
                .id(this.id)
                .tenantId(this.tenantId)
                .complaintId(this.complaintId)
                .externalSystem(this.externalSystem)
                .direction(this.direction)
                .eventType(this.eventType)
                .externalTicketId(this.externalTicketId)
                .status(this.status)
                .httpStatus(this.httpStatus)
                .requestPayload(this.requestPayload)
                .responsePayload(this.responsePayload)
                .errorMessage(this.errorMessage)
                .retryCount(this.retryCount)
                .correlationId(this.correlationId)
                .createdAt(this.createdAt)
                .build();
    }

    public static JpaIntegrationSyncRecord fromDomain(IntegrationSyncRecord d) {
        JpaIntegrationSyncRecord entity = new JpaIntegrationSyncRecord();
        entity.setId(d.getId());
        entity.setTenantId(d.getTenantId());
        entity.setComplaintId(d.getComplaintId());
        entity.setExternalSystem(d.getExternalSystem());
        entity.setDirection(d.getDirection());
        entity.setEventType(d.getEventType());
        entity.setExternalTicketId(d.getExternalTicketId());
        entity.setStatus(d.getStatus());
        entity.setHttpStatus(d.getHttpStatus());
        entity.setRequestPayload(d.getRequestPayload());
        entity.setResponsePayload(d.getResponsePayload());
        entity.setErrorMessage(d.getErrorMessage());
        entity.setRetryCount(d.getRetryCount());
        entity.setCorrelationId(d.getCorrelationId());
        if (d.getCreatedAt() != null) {
            entity.setCreatedAt(d.getCreatedAt());
        }
        return entity;
    }
}
