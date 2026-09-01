package com.govos.core.infrastructure.integration.ai;

import com.govos.core.application.complaint.AiClassificationClient;
import com.govos.core.domain.complaint.Priority;
import com.govos.core.domain.officer.OfficerProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Slf4j
public class HttpAiClassificationClient implements AiClassificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${govos.ai.service-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    @Value("${govos.internal.service-key:govos_internal_dev_key_123}")
    private String aiServiceKey;

    @Override
    public AiResult classifyComplaint(String title, String description, Double latitude, Double longitude) {
        String url = aiServiceBaseUrl + "/api/v1/ai/classify";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Key", aiServiceKey);
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = Map.of(
                "title", title,
                "description", description,
                "latitude", latitude != null ? latitude : 0.0,
                "longitude", longitude != null ? longitude : 0.0
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, request, new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> respBody = response.getBody();
                String category = (String) respBody.get("category");
                String priorityStr = (String) respBody.get("priority");
                String wardIdStr = (String) respBody.get("suggestedWard");

                Priority priority = Priority.valueOf(priorityStr.toUpperCase());
                UUID wardId = wardIdStr != null ? UUID.fromString(wardIdStr) : null;

                return new AiResult(category, priority, wardId);
            }
        } catch (Exception e) {
            log.error("Failed to call AI Service for classification: {}", e.getMessage());
        }

        // Fallback
        return new AiResult("UNKNOWN", Priority.MEDIUM, null);
    }

    @Override
    public AllocationResult allocateOfficer(UUID complaintId, String category, Priority priority, UUID wardId, List<OfficerProfile> availableOfficers) {
        String url = aiServiceBaseUrl + "/api/v1/ai/allocation/assign";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Key", aiServiceKey);
        headers.set("Content-Type", "application/json");

        List<Map<String, Object>> officersData = availableOfficers.stream().map(o -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("officer_id", o.getId().toString());
            map.put("name", o.getFullName());
            map.put("department", o.getDepartment());
            map.put("current_workload", o.getCurrentWorkload());
            map.put("ward_id", o.getAssignedWardId() != null ? o.getAssignedWardId().toString() : "");
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> body = Map.of(
                "complaint_id", complaintId.toString(),
                "category", category,
                "priority", priority.name(),
                "ward_id", wardId != null ? wardId.toString() : "",
                "available_officers", officersData
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, request, new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> respBody = response.getBody();
                String officerIdStr = (String) respBody.get("officerId");
                String reasoning = (String) respBody.get("reasoning");
                
                return new AllocationResult(UUID.fromString(officerIdStr), reasoning);
            }
        } catch (Exception e) {
            log.error("Failed to call AI Service for allocation: {}", e.getMessage());
        }

        // Fallback: pick the first one with lowest workload
        if (!availableOfficers.isEmpty()) {
            OfficerProfile best = availableOfficers.stream()
                .min((o1, o2) -> Integer.compare(o1.getCurrentWorkload(), o2.getCurrentWorkload()))
                .get();
            return new AllocationResult(best.getId(), "Fallback: Lowest workload");
        }
        
        return new AllocationResult(null, "No officers available");
    }
}
