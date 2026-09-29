package com.govos.core.application.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.govos.core.application.admin.AuditService;
import com.govos.core.application.outbox.OutboxService;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.complaint.ComplaintStatus;
import com.govos.core.domain.integration.IntegrationConfig;
import com.govos.core.domain.integration.IntegrationDirection;
import com.govos.core.domain.integration.IntegrationSyncRecord;
import com.govos.core.infrastructure.integration.iccc.IcccGatewayAdapter;
import com.govos.core.infrastructure.persistence.integration.JpaIntegrationConfig;
import com.govos.core.infrastructure.persistence.integration.JpaIntegrationConfigRepository;
import com.govos.core.infrastructure.persistence.integration.JpaIntegrationSyncRecord;
import com.govos.core.infrastructure.persistence.integration.JpaIntegrationSyncRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrationService {

    private final JpaIntegrationConfigRepository configRepository;
    private final JpaIntegrationSyncRepository syncRepository;
    private final ComplaintRepository complaintRepository;
    private final IcccGatewayAdapter icccAdapter;
    private final HmacSignatureService hmacService;
    private final OutboxService outboxService;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    /**
     * Synchronizes an active complaint with an external government system.
     */
    @Transactional
    public IntegrationSyncRecord syncComplaintToExternal(UUID tenantId, UUID complaintId, String externalSystem, String correlationId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        Optional<JpaIntegrationConfig> configOpt = configRepository.findByTenantIdAndExternalSystemAndIsEnabledTrue(tenantId, externalSystem);
        if (configOpt.isEmpty()) {
            log.warn("No active integration configuration found for tenant {} and system {}", tenantId, externalSystem);
            return null;
        }

        IntegrationConfig config = configOpt.get().toDomain();

        // Check if category is enabled for sync
        if (!"ALL".equalsIgnoreCase(config.getSyncCategories())) {
            List<String> allowedCategories = Arrays.asList(config.getSyncCategories().split(","));
            if (complaint.getCategory() != null && !allowedCategories.contains(complaint.getCategory().trim())) {
                log.debug("Skipping external sync: category {} not in configured list {}", complaint.getCategory(), config.getSyncCategories());
                return null;
            }
        }

        String effectiveCorrelationId = correlationId != null ? correlationId : UUID.randomUUID().toString();

        // Dispatch via adapter
        IcccGatewayAdapter.DispatchResult result = icccAdapter.dispatchComplaint(config, complaint, effectiveCorrelationId);

        // Record sync audit entry
        JpaIntegrationSyncRecord syncRecord = new JpaIntegrationSyncRecord();
        syncRecord.setTenantId(tenantId);
        syncRecord.setComplaintId(complaintId);
        syncRecord.setExternalSystem(externalSystem);
        syncRecord.setDirection(IntegrationDirection.OUTBOUND);
        syncRecord.setEventType("TICKET_CREATE");
        syncRecord.setExternalTicketId(result.externalTicketId());
        syncRecord.setStatus(result.isSuccess() ? "SUCCESS" : "FAILED");
        syncRecord.setHttpStatus(result.httpStatus());
        syncRecord.setRequestPayload(result.requestPayload());
        syncRecord.setResponsePayload(result.responsePayload());
        syncRecord.setErrorMessage(result.errorMessage());
        syncRecord.setCorrelationId(effectiveCorrelationId);
        syncRecord.setCreatedAt(Instant.now());

        JpaIntegrationSyncRecord savedRecord = syncRepository.save(syncRecord);

        // Update complaint entity with external reference
        if (result.isSuccess()) {
            complaint.markExternalSyncSuccess(externalSystem, result.externalTicketId(), result.externalStatus());
            complaintRepository.save(complaint);

            auditService.record(tenantId, null, "SYSTEM",
                    "INTEGRATION_SYNC_SUCCESS", "COMPLAINT", complaint.getId().toString(),
                    complaint.getComplaintNumber(),
                    String.format("{\"externalSystem\":\"%s\",\"externalTicketId\":\"%s\"}", externalSystem, result.externalTicketId()));

            outboxService.recordEvent(tenantId, "integration:synced", "COMPLAINT", complaint.getId(), complaint);
        } else {
            complaint.markExternalSyncFailed(externalSystem, result.errorMessage());
            complaintRepository.save(complaint);

            auditService.record(tenantId, null, "SYSTEM",
                    "INTEGRATION_SYNC_FAILED", "COMPLAINT", complaint.getId().toString(),
                    complaint.getComplaintNumber(),
                    String.format("{\"externalSystem\":\"%s\",\"error\":\"%s\"}", externalSystem, result.errorMessage()));

            outboxService.recordEvent(tenantId, "integration:failed", "COMPLAINT", complaint.getId(), complaint);
        }

        return savedRecord.toDomain();
    }

    /**
     * Ingests and processes an authenticated inbound webhook from an external system.
     * Enforces the False-Closure Guard.
     */
    @Transactional
    public Map<String, Object> processInboundWebhook(String systemName, String rawPayload,
                                                     String signatureHeader, String timestampHeader,
                                                     String tenantIdHeader) {
        // 1. Verify Timestamp (< 300s window)
        if (!hmacService.isTimestampValid(timestampHeader, 300L)) {
            log.warn("Inbound webhook rejected: timestamp drift exceeds tolerance (timestamp: {})", timestampHeader);
            throw new SecurityException("Webhook rejected: timestamp invalid or expired");
        }

        // 2. Parse payload to extract complaint and tenant identifiers
        Map<String, Object> payloadMap;
        try {
            payloadMap = objectMapper.readValue(rawPayload, Map.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JSON payload: " + e.getMessage());
        }

        String complaintNumber = (String) payloadMap.get("complaintNumber");
        String externalTicketId = (String) payloadMap.get("externalTicketId");
        String externalStatus = (String) payloadMap.get("status");
        String notes = (String) payloadMap.get("notes");
        String evidenceUrl = (String) payloadMap.get("evidenceUrl");

        UUID tenantId = null;
        if (tenantIdHeader != null && !tenantIdHeader.isBlank()) {
            try {
                tenantId = UUID.fromString(tenantIdHeader.trim());
            } catch (Exception ignored) {}
        }
        if (tenantId == null && payloadMap.containsKey("tenantId")) {
            try {
                tenantId = UUID.fromString(String.valueOf(payloadMap.get("tenantId")));
            } catch (Exception ignored) {}
        }

        // Find complaint
        Complaint complaint = null;
        if (complaintNumber != null) {
            complaint = complaintRepository.findByComplaintNumber(complaintNumber).orElse(null);
        }
        if (complaint == null && externalTicketId != null) {
            // Find by external ticket ID
            Optional<JpaIntegrationSyncRecord> lastSync = syncRepository.findFirstByExternalSystemAndExternalTicketId(systemName, externalTicketId);
            if (lastSync.isPresent()) {
                complaint = complaintRepository.findById(lastSync.get().getComplaintId()).orElse(null);
            }
        }

        if (complaint == null) {
            throw new NoSuchElementException("Complaint not found for incoming webhook: " + complaintNumber + " / " + externalTicketId);
        }

        if (tenantId == null) {
            tenantId = complaint.getTenantId();
        }

        // 3. Verify HMAC signature using tenant's configured secret
        Optional<JpaIntegrationConfig> configOpt = configRepository.findByTenantIdAndExternalSystemAndIsEnabledTrue(tenantId, systemName);
        if (configOpt.isEmpty()) {
            throw new SecurityException("Integration " + systemName + " is not configured or disabled for this tenant");
        }

        String secret = configOpt.get().getWebhookSecret();
        if (!hmacService.verifySignature(rawPayload, secret, signatureHeader)) {
            log.warn("Inbound webhook signature verification failed for system {}", systemName);
            throw new SecurityException("Invalid HMAC cryptographic signature");
        }

        // 4. Save Inbound Audit Record
        JpaIntegrationSyncRecord inboundRecord = new JpaIntegrationSyncRecord();
        inboundRecord.setTenantId(tenantId);
        inboundRecord.setComplaintId(complaint.getId());
        inboundRecord.setExternalSystem(systemName);
        inboundRecord.setDirection(IntegrationDirection.INBOUND);
        inboundRecord.setEventType("STATUS_UPDATE");
        inboundRecord.setExternalTicketId(externalTicketId != null ? externalTicketId : complaint.getExternalTicketId());
        inboundRecord.setStatus("SUCCESS");
        inboundRecord.setHttpStatus(200);
        inboundRecord.setRequestPayload(rawPayload);
        inboundRecord.setCreatedAt(Instant.now());
        syncRepository.save(inboundRecord);

        // 5. Apply State Transitions with False-Closure Guard
        String normalizedStatus = externalStatus != null ? externalStatus.trim().toUpperCase() : "";
        boolean statusChanged = false;

        if (List.of("RESOLVED", "CLOSED", "COMPLETED", "WORK_COMPLETED").contains(normalizedStatus)) {
            // FALSE-CLOSURE GUARD: Move to VERIFICATION_PENDING, not directly to RESOLVED or CLOSED!
            if (complaint.getStatus() != ComplaintStatus.RESOLVED && complaint.getStatus() != ComplaintStatus.CLOSED) {
                complaint.updateStatus(ComplaintStatus.VERIFICATION_PENDING);
                if (notes != null && !notes.isBlank()) {
                    complaint.setResolutionNotes("[External " + systemName + "] " + notes);
                }
                if (evidenceUrl != null && !evidenceUrl.isBlank()) {
                    complaint.setResolutionEvidenceUrl(evidenceUrl);
                }
                statusChanged = true;
                log.info("False-Closure Guard activated: External system {} reported {}, complaint {} transitioned to VERIFICATION_PENDING",
                        systemName, normalizedStatus, complaint.getComplaintNumber());
            }
        } else if (List.of("IN_PROGRESS", "FIELD_WORK", "ASSIGNED").contains(normalizedStatus)) {
            if (complaint.getStatus() == ComplaintStatus.NEW || complaint.getStatus() == ComplaintStatus.ASSIGNED) {
                complaint.updateStatus(ComplaintStatus.IN_PROGRESS);
                statusChanged = true;
            }
        }

        complaint.setLastExternalStatus(normalizedStatus);
        complaint.setExternalSyncedAt(Instant.now());
        complaint.setIntegrationStatus("SYNCED");
        Complaint saved = complaintRepository.save(complaint);

        auditService.record(tenantId, null, "SYSTEM",
                "INTEGRATION_WEBHOOK_RECEIVED", "COMPLAINT", saved.getId().toString(),
                saved.getComplaintNumber(),
                String.format("{\"externalSystem\":\"%s\",\"externalStatus\":\"%s\",\"govOsStatus\":\"%s\"}",
                        systemName, normalizedStatus, saved.getStatus()));

        if (statusChanged) {
            outboxService.recordEvent(tenantId, "complaint:status_changed", "COMPLAINT", saved.getId(), saved);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("complaintNumber", saved.getComplaintNumber());
        response.put("govOsStatus", saved.getStatus().name());
        response.put("externalStatus", normalizedStatus);
        response.put("message", "Inbound update processed successfully under GovOS verification guard");
        return response;
    }

    /**
     * Returns the full integration sync audit history for a complaint.
     */
    @Transactional(readOnly = true)
    public List<IntegrationSyncRecord> getSyncHistory(UUID tenantId, UUID complaintId) {
        return syncRepository.findByTenantIdAndComplaintIdOrderByCreatedAtDesc(tenantId, complaintId)
                .stream()
                .map(JpaIntegrationSyncRecord::toDomain)
                .toList();
    }
}
