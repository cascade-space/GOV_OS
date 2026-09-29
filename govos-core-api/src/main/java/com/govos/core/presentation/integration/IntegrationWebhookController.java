package com.govos.core.presentation.integration;

import com.govos.core.application.integration.IntegrationService;
import com.govos.core.domain.integration.IntegrationSyncRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
@Slf4j
public class IntegrationWebhookController {

    private final IntegrationService integrationService;

    /**
     * Authenticated Inbound Webhook Receiver for external government systems.
     * Open to third parties but strictly protected via HMAC-SHA256 signatures and timestamp drift checks.
     */
    @PostMapping("/webhook/{systemName}")
    public ResponseEntity<?> receiveWebhook(
            @PathVariable String systemName,
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-GovOS-Signature", required = false) String signature,
            @RequestHeader(value = "X-GovOS-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "X-GovOS-Tenant-Id", required = false) String tenantId
    ) {
        log.info("Received inbound webhook from external system: {}", systemName);
        try {
            Map<String, Object> result = integrationService.processInboundWebhook(
                    systemName, rawPayload, signature, timestamp, tenantId
            );
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            log.warn("Security violation on inbound webhook for {}: {}", systemName, se.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", se.getMessage()));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Bad Request", "message", iae.getMessage()));
        } catch (NoSuchElementException nse) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", nse.getMessage()));
        } catch (Exception e) {
            log.error("Internal error processing inbound webhook for {}", systemName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * View integration sync audit history for a specific complaint.
     */
    @GetMapping("/complaints/{complaintId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'DEPT_HEAD')")
    public ResponseEntity<List<IntegrationSyncRecord>> getSyncHistory(
            @RequestAttribute("tenantId") UUID tenantId,
            @PathVariable UUID complaintId
    ) {
        List<IntegrationSyncRecord> history = integrationService.getSyncHistory(tenantId, complaintId);
        return ResponseEntity.ok(history);
    }

    /**
     * Trigger manual synchronization retry from Admin console.
     */
    @PostMapping("/complaints/{complaintId}/sync")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> triggerManualSync(
            @RequestAttribute("tenantId") UUID tenantId,
            @PathVariable UUID complaintId,
            @RequestParam(defaultValue = "ICCC_MUNICIPAL") String systemName
    ) {
        IntegrationSyncRecord record = integrationService.syncComplaintToExternal(
                tenantId, complaintId, systemName, UUID.randomUUID().toString()
        );
        if (record == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Integration not configured or category not eligible"));
        }
        return ResponseEntity.ok(record);
    }
}
