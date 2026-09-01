package com.govos.core.application.admin;

import com.govos.core.domain.admin.AuditLog;
import com.govos.core.infrastructure.persistence.admin.JpaAuditLog;
import com.govos.core.infrastructure.persistence.admin.SpringDataAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final SpringDataAuditLogRepository repository;

    /**
     * Records an immutable audit event. Runs asynchronously in a NEW transaction
     * so it never rolls back with the calling transaction.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(UUID tenantId, UUID actorId, String actorName,
                       String action, String resourceType, String resourceId,
                       String resourceLabel, String payload) {
        try {
            JpaAuditLog log = new JpaAuditLog();
            log.setTenantId(tenantId);
            log.setActorId(actorId);
            log.setActorName(actorName != null ? actorName : "SYSTEM");
            log.setAction(action);
            log.setResourceType(resourceType);
            log.setResourceId(resourceId != null ? resourceId : "N/A");
            log.setResourceLabel(resourceLabel);
            log.setPayload(payload);
            repository.save(log);
        } catch (Exception e) {
            // Audit failures MUST NOT impact the main flow
            log.warn("Failed to record audit event: {} on {}/{}", action, resourceType, resourceId, e);
        }
    }

    /**
     * Returns the most recent N audit entries for a tenant.
     */
    @Transactional(readOnly = true)
    public List<AuditLog> findRecent(UUID tenantId, int limit) {
        return repository
                .findByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(0, limit))
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private AuditLog toDomain(JpaAuditLog jpa) {
        AuditLog a = new AuditLog();
        a.setId(jpa.getId());
        a.setTenantId(jpa.getTenantId());
        a.setAction(jpa.getAction());
        a.setUser(jpa.getActorName());
        a.setResourceType(jpa.getResourceType());
        a.setResourceId(jpa.getResourceId() + (jpa.getResourceLabel() != null ? " · " + jpa.getResourceLabel() : ""));
        a.setTimestamp(jpa.getCreatedAt()
                .atZone(ZoneId.of("Asia/Kolkata"))
                .toLocalDateTime());
        return a;
    }
}
