package com.govos.core.application.sla;

import com.govos.core.domain.complaint.Priority;
import com.govos.core.infrastructure.persistence.sla.JpaSlaPolicy;
import com.govos.core.infrastructure.persistence.sla.JpaSlaPolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlaPolicyService {

    private final JpaSlaPolicyRepository slaPolicyRepository;

    public record ResolvedSlaTarget(int resolutionHours, double warningThresholdRatio, int escalationL1Hours, int escalationL2Hours) {}

    public ResolvedSlaTarget resolveTarget(UUID tenantId, String category, Priority priority) {
        if (priority == null) {
            priority = Priority.MEDIUM;
        }

        String prioStr = priority.name();

        if (tenantId != null) {
            // 1. Try category-specific policy
            if (category != null && !category.isBlank()) {
                Optional<JpaSlaPolicy> catPolicy = slaPolicyRepository.findFirstByTenantIdAndCategoryIgnoreCaseAndPriority(
                        tenantId, category.trim(), prioStr);
                if (catPolicy.isPresent()) {
                    JpaSlaPolicy p = catPolicy.get();
                    return new ResolvedSlaTarget(p.getResolutionHours(), p.getWarningThresholdRatio(), p.getEscalationLevel1Hours(), p.getEscalationLevel2Hours());
                }
            }

            // 2. Try tenant default for priority
            Optional<JpaSlaPolicy> tenantPolicy = slaPolicyRepository.findFirstByTenantIdAndPriority(tenantId, prioStr);
            if (tenantPolicy.isPresent()) {
                JpaSlaPolicy p = tenantPolicy.get();
                return new ResolvedSlaTarget(p.getResolutionHours(), p.getWarningThresholdRatio(), p.getEscalationLevel1Hours(), p.getEscalationLevel2Hours());
            }
        }

        // 3. Fallback to Blueprint Defaults (Section 17)
        int defaultHours = switch (priority) {
            case CRITICAL -> 12;
            case HIGH -> 24;
            case MEDIUM -> 48;
            case LOW -> 72;
        };

        return new ResolvedSlaTarget(defaultHours, 0.75, 24, 48);
    }
}
