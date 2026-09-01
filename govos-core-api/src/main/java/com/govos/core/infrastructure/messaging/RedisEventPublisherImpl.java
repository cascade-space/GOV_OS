package com.govos.core.infrastructure.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.govos.core.application.complaint.EventPublisher;
import com.govos.core.domain.complaint.Complaint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisEventPublisherImpl implements EventPublisher {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private static final String CHANNEL = "govos:events";

    @Override
    public void publishComplaintCreated(Complaint complaint) {
        publish("complaint:created", complaint.getTenantId(), complaint);
    }

    @Override
    public void publishComplaintStatusChanged(Complaint complaint) {
        publish("complaint:status_changed", complaint.getTenantId(), complaint);
    }

    @Override
    public void publishAssetMaintenanceDue(com.govos.core.domain.asset.CivicAsset asset) {
        publish("asset:maintenance_due", asset.getTenantId(), asset);
    }

    @Override
    public void publishDocumentRouted(com.govos.core.domain.document.GovDocument document) {
        publish("document:routed", document.getTenantId(), document);
    }

    private void publish(String type, java.util.UUID tenantId, Object data) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", type);
            payload.put("tenantId", tenantId.toString());
            
            // Broadcast target definition
            Map<String, String> target = new HashMap<>();
            target.put("roomType", "tenant");
            target.put("roomId", tenantId.toString());
            payload.put("target", target);
            
            // Data
            payload.put("data", data);

            String jsonPayload = objectMapper.writeValueAsString(payload);
            redisTemplate.convertAndSend(CHANNEL, jsonPayload);
            log.debug("Published event {} for tenant {}", type, tenantId);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event payload", e);
        }
    }
}
