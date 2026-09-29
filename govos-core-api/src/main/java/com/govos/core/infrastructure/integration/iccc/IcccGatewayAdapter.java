package com.govos.core.infrastructure.integration.iccc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.govos.core.application.integration.HmacSignatureService;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.integration.IntegrationConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class IcccGatewayAdapter {

    private final HmacSignatureService hmacSignatureService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public record DispatchResult(
            boolean isSuccess,
            int httpStatus,
            String externalTicketId,
            String externalStatus,
            String requestPayload,
            String responsePayload,
            String errorMessage
    ) {}

    /**
     * Dispatches a GovOS complaint to the external Municipal ICCC API.
     */
    public DispatchResult dispatchComplaint(IntegrationConfig config, Complaint complaint, String correlationId) {
        try {
            // 1. Build standardized outbound payload
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("sourceSystem", "GovOS");
            payloadMap.put("complaintNumber", complaint.getComplaintNumber());
            payloadMap.put("tenantId", complaint.getTenantId().toString());
            payloadMap.put("title", complaint.getTitle());
            payloadMap.put("description", complaint.getDescription());
            payloadMap.put("category", complaint.getCategory());
            payloadMap.put("subCategory", complaint.getSubCategory());
            payloadMap.put("priority", complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM");
            payloadMap.put("status", complaint.getStatus() != null ? complaint.getStatus().name() : "NEW");
            payloadMap.put("latitude", complaint.getLatitude());
            payloadMap.put("longitude", complaint.getLongitude());
            payloadMap.put("locationAddress", complaint.getLocationAddress());
            payloadMap.put("citizenName", complaint.getReporterName());
            payloadMap.put("citizenMobile", complaint.getReporterMobile());
            payloadMap.put("createdAt", complaint.getCreatedAt() != null ? complaint.getCreatedAt().toString() : Instant.now().toString());

            String payloadJson = objectMapper.writeValueAsString(payloadMap);
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String signature = hmacSignatureService.computeSignature(payloadJson, config.getWebhookSecret());

            // 2. Build HTTP request with zero-trust headers
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(config.getWebhookUrl()))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("X-GovOS-Signature", signature)
                    .header("X-GovOS-Timestamp", timestamp)
                    .header("X-GovOS-Tenant-Id", complaint.getTenantId().toString())
                    .header("X-Correlation-ID", correlationId != null ? correlationId : UUID.randomUUID().toString())
                    .POST(HttpRequest.BodyPublishers.ofString(payloadJson))
                    .build();

            log.info("Dispatching complaint {} to ICCC Gateway endpoint {}", complaint.getComplaintNumber(), config.getWebhookUrl());

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();
            String responseBody = response.body();

            if (statusCode >= 200 && statusCode < 300) {
                // Parse external ticket ID if present in response
                String externalTicketId = null;
                String externalStatus = "ACKNOWLEDGED";
                try {
                    Map<String, Object> respMap = objectMapper.readValue(responseBody, Map.class);
                    if (respMap.containsKey("externalTicketId")) {
                        externalTicketId = String.valueOf(respMap.get("externalTicketId"));
                    } else if (respMap.containsKey("ticketId")) {
                        externalTicketId = String.valueOf(respMap.get("ticketId"));
                    }
                    if (respMap.containsKey("status")) {
                        externalStatus = String.valueOf(respMap.get("status"));
                    }
                } catch (Exception parseEx) {
                    log.debug("Response is non-JSON or could not parse ticketId: {}", responseBody);
                }

                if (externalTicketId == null || externalTicketId.isBlank()) {
                    externalTicketId = "ICCC-" + complaint.getComplaintNumber();
                }

                log.info("Successfully synced complaint {} with ICCC (External Ref: {})", complaint.getComplaintNumber(), externalTicketId);
                return new DispatchResult(true, statusCode, externalTicketId, externalStatus, payloadJson, responseBody, null);
            } else {
                log.warn("ICCC Gateway returned HTTP {}: {}", statusCode, responseBody);
                return new DispatchResult(false, statusCode, null, "FAILED", payloadJson, responseBody,
                        "External HTTP " + statusCode + ": " + responseBody);
            }
        } catch (Exception e) {
            log.error("Exception during ICCC dispatch for complaint {}", complaint.getComplaintNumber(), e);
            return new DispatchResult(false, 500, null, "FAILED", null, null, e.getMessage());
        }
    }
}
