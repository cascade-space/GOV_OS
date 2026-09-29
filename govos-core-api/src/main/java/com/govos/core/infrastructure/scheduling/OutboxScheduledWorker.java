package com.govos.core.infrastructure.scheduling;

import com.govos.core.application.outbox.OutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxScheduledWorker {

    private final OutboxService outboxService;

    /**
     * Safety net poller: Every 5 seconds, scans for any PENDING or retried outbox events
     * that were not dispatched via the immediate commit listener (e.g. temporary Redis downtime).
     */
    @Scheduled(fixedDelay = 5000)
    public void pollAndDispatchPendingEvents() {
        try {
            int dispatched = outboxService.dispatchPendingBatch(50);
            if (dispatched > 0) {
                log.info("Outbox poller dispatched {} pending events to Redis", dispatched);
            }
        } catch (Exception e) {
            log.error("Outbox poller batch dispatch failed", e);
        }
    }

    /**
     * Nightly cleanup job: Runs at 02:00 AM every day to purge PUBLISHED outbox records
     * older than 7 days, preventing database bloat while maintaining incident auditability.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void purgeOldEvents() {
        try {
            int purged = outboxService.purgeOldPublishedEvents(7);
            log.info("Nightly outbox cleanup completed: purged {} records older than 7 days", purged);
        } catch (Exception e) {
            log.error("Failed to execute nightly outbox purge", e);
        }
    }
}
