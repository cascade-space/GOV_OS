package com.govos.core.presentation.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.govos.core.application.integration.HmacSignatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/v1/mock/iccc")
@RequiredArgsConstructor
@Slf4j
public class MockIcccApiController {

    private final HmacSignatureService hmacService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private static final String DEFAULT_MOCK_SECRET = "govos_iccc_secret_key_demo_2026";

    /**
     * Mock ICCC Gateway: Receives GovOS Outbound Ticket Dispatches.
     */
    @PostMapping("/tickets")
    public ResponseEntity<?> receiveTicket(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-GovOS-Signature", required = false) String signature,
            @RequestHeader(value = "X-GovOS-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "X-Correlation-ID", required = false) String correlationId
    ) {
        String complaintNumber = (String) payload.get("complaintNumber");
        String title = (String) payload.get("title");
        log.info("[Mock ICCC Gateway] Received outbound ticket from GovOS: {} - '{}'", complaintNumber, title);

        int randomSeq = ThreadLocalRandom.current().nextInt(1000, 9999);
        String externalTicketId = "ICCC-202609-" + randomSeq;

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("status", "ACKNOWLEDGED");
        response.put("externalTicketId", externalTicketId);
        response.put("correlationId", correlationId);
        response.put("message", "Ticket registered in Smart Cities Integrated Command and Control Centre");
        response.put("receivedAt", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * Test utility: Simulates external field team resolving an issue and posting signed webhook to GovOS.
     */
    @PostMapping("/simulate-resolution")
    public ResponseEntity<?> simulateResolution(
            @RequestParam String complaintNumber,
            @RequestParam(required = false) String externalTicketId,
            @RequestParam(defaultValue = "RESOLVED") String externalStatus,
            @RequestParam(defaultValue = "Pothole repaired and road leveled with cold-mix asphalt by ICCC Road Operations Team") String notes,
            @RequestParam(defaultValue = "http://localhost:9000/civic-evidence/iccc_resolution_proof.jpg") String evidenceUrl,
            @RequestParam(defaultValue = DEFAULT_MOCK_SECRET) String secret
    ) {
        log.info("[Mock ICCC Gateway] Simulating external status {} for ticket {}", externalStatus, complaintNumber);
        try {
            Map<String, Object> webhookPayload = new HashMap<>();
            webhookPayload.put("complaintNumber", complaintNumber);
            webhookPayload.put("externalTicketId", externalTicketId != null ? externalTicketId : "ICCC-" + complaintNumber);
            webhookPayload.put("status", externalStatus);
            webhookPayload.put("notes", notes);
            webhookPayload.put("evidenceUrl", evidenceUrl);
            webhookPayload.put("timestamp", Instant.now().toString());

            String payloadJson = objectMapper.writeValueAsString(webhookPayload);
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String signature = hmacService.computeSignature(payloadJson, secret);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:8080/api/v1/integrations/webhook/ICCC_MUNICIPAL"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("X-GovOS-Signature", signature)
                    .header("X-GovOS-Timestamp", timestamp)
                    .header("X-GovOS-Tenant-Id", "00000000-0000-0000-0000-000000000002")
                    .POST(HttpRequest.BodyPublishers.ofString(payloadJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            Map<String, Object> simulationResult = new HashMap<>();
            simulationResult.put("simulatedWebhookStatus", response.statusCode());
            simulationResult.put("simulatedWebhookResponse", response.body());
            simulationResult.put("signatureSent", signature);
            simulationResult.put("timestampSent", timestamp);

            return ResponseEntity.status(response.statusCode()).body(simulationResult);
        } catch (Exception e) {
            log.error("[Mock ICCC Gateway] Error simulating external resolution", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
