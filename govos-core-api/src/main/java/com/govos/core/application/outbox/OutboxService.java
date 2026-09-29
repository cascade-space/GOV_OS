package com.govos.core.application.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.govos.core.domain.outbox.OutboxStatus;
import com.govos.core.infrastructure.persistence.outbox.JpaOutboxEvent;
import com.govos.core.infrastructure.persistence.outbox.JpaOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxService {

    private final JpaOutboxEventRepository outboxEventRepository;
    private final StringRedisTemplate redisTemplate;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private static final String REDIS_CHANNEL = "govos:events";

    /**
     * Records a domain event inside the active ACID database transaction.
     * Guaranteed to commit or roll back with the entity change.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public JpaOutboxEvent recordEvent(UUID tenantId, String eventType, String aggregateType, UUID aggregateId, Object payloadObj) {
        try {
            String payloadJson = objectMapper.writeValueAsString(payloadObj);

            JpaOutboxEvent event = new JpaOutboxEvent();
            event.setTenantId(tenantId);
            event.setEventType(eventType);
            event.setAggregateType(aggregateType);
            event.setAggregateId(aggregateId);
            event.setPayload(payloadJson);
            event.setStatus(OutboxStatus.PENDING);
            event.setCreatedAt(Instant.now());

            JpaOutboxEvent saved = outboxEventRepository.save(event);
            log.debug("Recorded outbox event {} for aggregate {}/{}", saved.getId(), aggregateType, aggregateId);

            // Fire internal event to trigger immediate dispatch AFTER commit
            applicationEventPublisher.publishEvent(new OutboxEventCommittedEvent(saved.getId()));

            return saved;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox event payload for {}/{}", aggregateType, aggregateId, e);
            throw new RuntimeException("Outbox serialization failure", e);
        }
    }

    /**
     * Dispatches an individual outbox event to Redis. Runs in a new transaction
     * to ensure status updates (PUBLISHED/FAILED) are persisted independently.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void publishOutboxEvent(UUID eventId) {
        JpaOutboxEvent event = outboxEventRepository.findById(eventId).orElse(null);
        if (event == null || event.getStatus() == OutboxStatus.PUBLISHED) {
            return;
        }

        try {
            Object parsedData = objectMapper.readTree(event.getPayload());

            Map<String, Object> message = new HashMap<>();
            message.put("type", event.getEventType());
            message.put("tenantId", event.getTenantId().toString());

            Map<String, String> target = new HashMap<>();
            target.put("roomType", "tenant");
            target.put("roomId", event.getTenantId().toString());
            message.put("target", target);

            message.put("data", parsedData);

            String redisJson = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(REDIS_CHANNEL, redisJson);

            event.setStatus(OutboxStatus.PUBLISHED);
            event.setPublishedAt(Instant.now());
            event.setErrorMessage(null);
            outboxEventRepository.save(event);

            log.info("Successfully dispatched outbox event {} ({}) to Redis channel {}",
                    event.getId(), event.getEventType(), REDIS_CHANNEL);
        } catch (Exception e) {
            log.warn("Failed to dispatch outbox event {}: {}", event.getId(), e.getMessage());
            event.setRetryCount(event.getRetryCount() + 1);
            event.setErrorMessage(e.getMessage());
            if (event.getRetryCount() >= 5) {
                event.setStatus(OutboxStatus.FAILED);
            }
            outboxEventRepository.save(event);
        }
    }

    /**
     * Safety-net poller: Dispatches pending events in batches using SKIP LOCKED.
     */
    @Transactional
    public int dispatchPendingBatch(int limit) {
        List<JpaOutboxEvent> pendingEvents = outboxEventRepository.findPendingEventsForUpdate(limit);
        int dispatched = 0;

        for (JpaOutboxEvent event : pendingEvents) {
            try {
                Object parsedData = objectMapper.readTree(event.getPayload());

                Map<String, Object> message = new HashMap<>();
                message.put("type", event.getEventType());
                message.put("tenantId", event.getTenantId().toString());

                Map<String, String> target = new HashMap<>();
                target.put("roomType", "tenant");
                target.put("roomId", event.getTenantId().toString());
                message.put("target", target);

                message.put("data", parsedData);

                String redisJson = objectMapper.writeValueAsString(message);
                redisTemplate.convertAndSend(REDIS_CHANNEL, redisJson);

                event.setStatus(OutboxStatus.PUBLISHED);
                event.setPublishedAt(Instant.now());
                event.setErrorMessage(null);
                outboxEventRepository.save(event);
                dispatched++;
            } catch (Exception e) {
                log.warn("Batch dispatch failed for outbox event {}: {}", event.getId(), e.getMessage());
                event.setRetryCount(event.getRetryCount() + 1);
                event.setErrorMessage(e.getMessage());
                if (event.getRetryCount() >= 5) {
                    event.setStatus(OutboxStatus.FAILED);
                }
                outboxEventRepository.save(event);
            }
        }

        return dispatched;
    }

    /**
     * Pruning job: Purges published outbox events older than 7 days.
     */
    @Transactional
    public int purgeOldPublishedEvents(int daysOld) {
        Instant cutoff = Instant.now().minus(daysOld, ChronoUnit.DAYS);
        int deleted = outboxEventRepository.deleteOldPublishedEvents(OutboxStatus.PUBLISHED, cutoff);
        if (deleted > 0) {
            log.info("Purged {} published outbox events older than {} days", deleted, daysOld);
        }
        return deleted;
    }
}
