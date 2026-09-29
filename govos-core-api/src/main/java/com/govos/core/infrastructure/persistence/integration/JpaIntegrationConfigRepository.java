package com.govos.core.infrastructure.persistence.integration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaIntegrationConfigRepository extends JpaRepository<JpaIntegrationConfig, UUID> {

    Optional<JpaIntegrationConfig> findByTenantIdAndExternalSystemAndIsEnabledTrue(UUID tenantId, String externalSystem);

    Optional<JpaIntegrationConfig> findByTenantIdAndExternalSystem(UUID tenantId, String externalSystem);
}
