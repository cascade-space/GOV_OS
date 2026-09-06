package com.govos.core.application.complaint;

import com.govos.core.application.admin.AuditService;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.complaint.ComplaintStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaScheduler {

    private final ComplaintRepository complaintRepository;
    private final EventPublisher eventPublisher;
    private final AuditService auditService;

    /**
     * Evaluates active complaints every 60 seconds against their SLA target deadlines.
     * Triggers warning at 75% elapsed window, and breach/auto-escalation upon expiration.
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 10000)
    @Transactional
    public void evaluateActiveComplaintsSla() {
        List<ComplaintStatus> activeStatuses = List.of(
                ComplaintStatus.NEW,
                ComplaintStatus.ASSIGNED,
                ComplaintStatus.IN_PROGRESS
        );

        List<Complaint> activeComplaints = complaintRepository.findByStatusIn(activeStatuses);
        if (activeComplaints.isEmpty()) {
            return;
        }

        Instant now = Instant.now();
        log.debug("Evaluating SLA targets for {} active complaints", activeComplaints.size());

        for (Complaint c : activeComplaints) {
            // Ensure SLA deadline is set if missing
            if (c.getSlaDeadline() == null) {
                c.computeAndSetSlaDeadline();
                complaintRepository.save(c);
            }

            Instant deadline = c.getSlaDeadline();

            // Check SLA Breach
            if (now.isAfter(deadline) && !c.isSlaBreached()) {
                c.markSlaBreached();
                Complaint saved = complaintRepository.save(c);

                eventPublisher.publishSlaBreach(saved);

                auditService.record(saved.getTenantId(), null, "SYSTEM",
                        "SLA_BREACHED", "COMPLAINT", saved.getId().toString(),
                        saved.getComplaintNumber(),
                        String.format("{\"deadline\":\"%s\",\"escalationLevel\":%d}",
                                deadline, saved.getEscalationLevel()));

                log.warn("SLA BREACH triggered for complaint {} (Tenant: {}). Escalation level: {}",
                        saved.getComplaintNumber(), saved.getTenantId(), saved.getEscalationLevel());
                continue;
            }

            // Check SLA Warning (75% elapsed window = remaining time <= 25%)
            if (!c.isSlaBreached() && !c.isSlaWarningSent()) {
                Instant createdAt = c.getCreatedAt() != null ? c.getCreatedAt() : now;
                Duration totalWindow = Duration.between(createdAt, deadline);
                Duration remaining = Duration.between(now, deadline);

                if (!totalWindow.isNegative() && !totalWindow.isZero()) {
                    double remainingRatio = (double) remaining.toSeconds() / (double) totalWindow.toSeconds();
                    if (remainingRatio <= 0.25) {
                        c.markSlaWarning();
                        Complaint saved = complaintRepository.save(c);

                        eventPublisher.publishSlaWarning(saved);

                        auditService.record(saved.getTenantId(), null, "SYSTEM",
                                "SLA_WARNING_SENT", "COMPLAINT", saved.getId().toString(),
                                saved.getComplaintNumber(),
                                String.format("{\"remainingMinutes\":%d}", remaining.toMinutes()));

                        log.info("SLA Warning dispatched for complaint {}. Remaining minutes: {}",
                                saved.getComplaintNumber(), remaining.toMinutes());
                    }
                }
            }
        }
    }
}
