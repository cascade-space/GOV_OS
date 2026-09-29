package com.govos.core.domain.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationSyncRecord {
    private UUID id;
    private UUID tenantId;
    private UUID complaintId;
    private String externalSystem;
    private IntegrationDirection direction;
    private String eventType;
    private String externalTicketId;
    private String status; // PENDING, SUCCESS, FAILED
    private Integer httpStatus;
    private String requestPayload;
    private String responsePayload;
    private String errorMessage;
    private int retryCount;
    private String correlationId;
    private Instant createdAt;
}
