package com.govos.core.infrastructure.persistence.asset;

import com.govos.core.domain.asset.CivicAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataAssetRepository extends JpaRepository<CivicAsset, UUID> {
    List<CivicAsset> findAllByTenantId(UUID tenantId);
    Optional<CivicAsset> findByIdAndTenantId(UUID id, UUID tenantId);
    long countByTenantId(UUID tenantId);
    List<CivicAsset> findAllByNextMaintenanceDate(java.time.LocalDate date);
}
