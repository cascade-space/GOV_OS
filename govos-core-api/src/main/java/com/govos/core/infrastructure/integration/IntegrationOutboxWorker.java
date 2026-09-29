package com.govos.core.infrastructure.integration;

import com.govos.core.application.integration.IntegrationService;
import com.govos.core.application.outbox.OutboxEventCommittedEvent;
import com.govos.core.infrastructure.persistence.integration.JpaIntegrationConfig;
import com.govos.core.infrastructure.persistence.integration.JpaIntegrationConfigRepository;
import com.govos.core.infrastructure.persistence.outbox.JpaOutboxEvent;
import com.govos.core.infrastructure.persistence.outbox.JpaOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class IntegrationOutboxWorker {

    private final JpaOutboxEventRepository outboxRepository;
    private final JpaIntegrationConfigRepository configRepository;
    private final IntegrationService integrationService;

    /**
     * Listens for committed outbox events and triggers outbound integration synchronization
     * for newly created complaints when configured.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOutboxEventForIntegration(OutboxEventCommittedEvent event) {
        try {
            Optional<JpaOutboxEvent> outboxOpt = outboxRepository.findById(event.eventId());
            if (outboxOpt.isEmpty()) {
                return;
            }

            JpaOutboxEvent outbox = outboxOpt.get();
            if ("complaint:created".equalsIgnoreCase(outbox.getEventType()) && "COMPLAINT".equalsIgnoreCase(outbox.getAggregateType())) {
                log.debug("Outbox event complaint:created detected for aggregate {}. Checking integration configs...", outbox.getAggregateId());

                Optional<JpaIntegrationConfig> configOpt = configRepository.findByTenantIdAndExternalSystemAndIsEnabledTrue(
                        outbox.getTenantId(), "ICCC_MUNICIPAL");

                if (configOpt.isPresent() && configOpt.get().isAutoSyncOnCreate()) {
                    log.info("Auto-syncing newly created complaint {} to ICCC Gateway...", outbox.getAggregateId());
                    integrationService.syncComplaintToExternal(
                            outbox.getTenantId(),
                            outbox.getAggregateId(),
                            "ICCC_MUNICIPAL",
                            null
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Integration outbox worker failed to process event {}: {}", event.eventId(), e.getMessage());
        }
    }
}
