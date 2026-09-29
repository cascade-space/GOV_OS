package com.govos.core.infrastructure.persistence.sla;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaSlaPolicyRepository extends JpaRepository<JpaSlaPolicy, UUID> {

    Optional<JpaSlaPolicy> findFirstByTenantIdAndCategoryIgnoreCaseAndPriority(
            UUID tenantId, String category, String priority);

    Optional<JpaSlaPolicy> findFirstByTenantIdAndPriority(UUID tenantId, String priority);
}
