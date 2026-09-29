package com.govos.core.infrastructure.messaging;

import com.govos.core.application.outbox.OutboxEventCommittedEvent;
import com.govos.core.application.outbox.OutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxEventListener {

    private final OutboxService outboxService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOutboxEventCommitted(OutboxEventCommittedEvent event) {
        log.debug("Transaction committed for outbox event {}. Triggering immediate async dispatch...", event.eventId());
        try {
            outboxService.publishOutboxEvent(event.eventId());
        } catch (Exception e) {
            log.warn("Immediate dispatch failed for outbox event {}, will be retried by scheduled worker: {}",
                    event.eventId(), e.getMessage());
        }
    }
}
