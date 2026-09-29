package com.govos.core.infrastructure.persistence.integration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaIntegrationSyncRepository extends JpaRepository<JpaIntegrationSyncRecord, UUID> {

    List<JpaIntegrationSyncRecord> findByTenantIdAndComplaintIdOrderByCreatedAtDesc(UUID tenantId, UUID complaintId);

    Optional<JpaIntegrationSyncRecord> findFirstByExternalSystemAndExternalTicketId(String externalSystem, String externalTicketId);

    Optional<JpaIntegrationSyncRecord> findFirstByCorrelationId(String correlationId);

    List<JpaIntegrationSyncRecord> findByStatusAndRetryCountLessThan(String status, int maxRetries);
}
