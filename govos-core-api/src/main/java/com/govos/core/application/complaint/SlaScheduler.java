package com.govos.core.application.complaint;

import com.govos.core.application.admin.AuditService;
import com.govos.core.application.outbox.OutboxService;
import com.govos.core.application.sla.SlaPolicyService;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.complaint.ComplaintStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaScheduler {

    private final ComplaintRepository complaintRepository;
    private final OutboxService outboxService;
    private final AuditService auditService;
    private final SlaPolicyService slaPolicyService;
    private final StringRedisTemplate redisTemplate;

    private static final String LOCK_KEY = "lock:sla_watchdog";
    private final String instanceId = UUID.randomUUID().toString();

    /**
     * Evaluates active complaints every 60 seconds against their SLA targets.
     * Uses a non-blocking Redis distributed lock with 50s TTL to guarantee idempotency across nodes.
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 10000)
    @Transactional
    public void evaluateActiveComplaintsSla() {
        // 1. Acquire distributed lock
        Boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(LOCK_KEY, instanceId, Duration.ofSeconds(50));
        if (Boolean.FALSE.equals(lockAcquired)) {
            log.debug("SLA watchdog skipped on this node: lock held by another instance");
            return;
        }

        try {
            Instant now = Instant.now();

            // 2. Lifecycle Scope 1: Active Execution SLA (NEW, ASSIGNED, IN_PROGRESS, REWORK_REQUIRED)
            List<ComplaintStatus> activeStatuses = List.of(
                    ComplaintStatus.NEW,
                    ComplaintStatus.ASSIGNED,
                    ComplaintStatus.IN_PROGRESS,
                    ComplaintStatus.REWORK_REQUIRED
            );

            List<Complaint> activeComplaints = complaintRepository.findByStatusIn(activeStatuses);
            if (!activeComplaints.isEmpty()) {
                log.debug("Evaluating SLA targets for {} active complaints", activeComplaints.size());

                for (Complaint c : activeComplaints) {
                    var target = slaPolicyService.resolveTarget(c.getTenantId(), c.getCategory(), c.getPriority());

                    // Ensure SLA deadline is set
                    if (c.getSlaDeadline() == null) {
                        Instant base = c.getCreatedAt() != null ? c.getCreatedAt() : now;
                        c.setSlaDeadline(base.plus(Duration.ofHours(target.resolutionHours())));
                        complaintRepository.save(c);
                    }

                    Instant deadline = c.getSlaDeadline();

                    // Check Level 2 Escalation: Breached & unaddressed for 24h past initial breach
                    if (c.isSlaBreached() && c.getEscalationLevel() == 1) {
                        Instant level2Threshold = deadline.plus(Duration.ofHours(target.escalationL1Hours()));
                        if (now.isAfter(level2Threshold)) {
                            c.escalateToLevel2();
                            Complaint saved = complaintRepository.save(c);

                            outboxService.recordEvent(saved.getTenantId(), "sla:escalated", "COMPLAINT", saved.getId(), saved);

                            auditService.record(saved.getTenantId(), null, "SYSTEM",
                                    "SLA_ESCALATED_LEVEL_2", "COMPLAINT", saved.getId().toString(),
                                    saved.getComplaintNumber(),
                                    String.format("{\"deadline\":\"%s\",\"escalationLevel\":2,\"priority\":\"CRITICAL\"}", deadline));

                            log.warn("CRITICAL: Complaint {} has breached SLA for >24h! Escalated to Level 2 (Commissioner). Priority upgraded to CRITICAL.",
                                    saved.getComplaintNumber());
                            continue;
                        }
                    }

                    // Check Level 1 Initial Breach
                    if (now.isAfter(deadline) && !c.isSlaBreached()) {
                        c.markSlaBreached();
                        Complaint saved = complaintRepository.save(c);

                        outboxService.recordEvent(saved.getTenantId(), "sla:breach", "COMPLAINT", saved.getId(), saved);

                        auditService.record(saved.getTenantId(), null, "SYSTEM",
                                "SLA_BREACHED", "COMPLAINT", saved.getId().toString(),
                                saved.getComplaintNumber(),
                                String.format("{\"deadline\":\"%s\",\"escalationLevel\":1}", deadline));

                        log.warn("SLA BREACH triggered for complaint {} (Tenant: {}). Escalated to Level 1 (Dept Head).",
                                saved.getComplaintNumber(), saved.getTenantId());
                        continue;
                    }

                    // Check SLA Warning (Configurable threshold, default 75% elapsed)
                    if (!c.isSlaBreached() && !c.isSlaWarningSent()) {
                        Instant createdAt = c.getCreatedAt() != null ? c.getCreatedAt() : now;
                        Duration totalWindow = Duration.between(createdAt, deadline);
                        Duration remaining = Duration.between(now, deadline);

                        if (!totalWindow.isNegative() && !totalWindow.isZero()) {
                            double remainingRatio = (double) remaining.toSeconds() / (double) totalWindow.toSeconds();
                            double warningThresholdRemaining = 1.0 - target.warningThresholdRatio(); // e.g. 0.25 (25% remaining)
                            if (remainingRatio <= warningThresholdRemaining) {
                                c.markSlaWarning();
                                Complaint saved = complaintRepository.save(c);

                                outboxService.recordEvent(saved.getTenantId(), "sla:warning", "COMPLAINT", saved.getId(), saved);

                                auditService.record(saved.getTenantId(), null, "SYSTEM",
                                        "SLA_WARNING_SENT", "COMPLAINT", saved.getId().toString(),
                                        saved.getComplaintNumber(),
                                        String.format("{\"remainingMinutes\":%d,\"ratioElapsed\":%.2f}",
                                                remaining.toMinutes(), (1.0 - remainingRatio)));

                                log.info("SLA Warning dispatched for complaint {}. Remaining minutes: {}",
                                        saved.getComplaintNumber(), remaining.toMinutes());
                            }
                        }
                    }
                }
            }

            // 3. Lifecycle Scope 2: 72-Hour Auto-Close for RESOLVED complaints
            List<Complaint> resolvedComplaints = complaintRepository.findByStatusIn(List.of(ComplaintStatus.RESOLVED));
            for (Complaint res : resolvedComplaints) {
                Instant autoCloseDeadline = res.getAutoCloseAt();
                if (autoCloseDeadline == null && res.getResolvedAt() != null) {
                    autoCloseDeadline = res.getResolvedAt().plus(Duration.ofHours(72));
                }
                if (autoCloseDeadline != null && now.isAfter(autoCloseDeadline)) {
                    res.autoClose();
                    Complaint closed = complaintRepository.save(res);

                    outboxService.recordEvent(closed.getTenantId(), "complaint:status_changed", "COMPLAINT", closed.getId(), closed);

                    auditService.record(closed.getTenantId(), null, "SYSTEM",
                            "COMPLAINT_AUTO_CLOSED", "COMPLAINT", closed.getId().toString(),
                            closed.getComplaintNumber(),
                            String.format("{\"autoCloseAt\":\"%s\",\"closedAt\":\"%s\"}",
                                    res.getAutoCloseAt(), now));

                    log.info("Complaint {} automatically transitioned from RESOLVED to CLOSED following 72h window expiry",
                            closed.getComplaintNumber());
                }
            }

        } finally {
            // Optional: lock will naturally expire in 50s; delete if this instance owns it
            try {
                String currentLock = redisTemplate.opsForValue().get(LOCK_KEY);
                if (instanceId.equals(currentLock)) {
                    redisTemplate.delete(LOCK_KEY);
                }
            } catch (Exception e) {
                log.debug("Error releasing SLA lock: {}", e.getMessage());
            }
        }
    }
}
