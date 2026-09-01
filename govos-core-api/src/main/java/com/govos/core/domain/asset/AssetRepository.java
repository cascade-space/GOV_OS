package com.govos.core.domain.asset;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetRepository {
    List<CivicAsset> findAllByTenantId(UUID tenantId);
    Optional<CivicAsset> findByIdAndTenantId(UUID id, UUID tenantId);
    CivicAsset save(CivicAsset asset);
    void delete(CivicAsset asset);
    long countByTenantId(UUID tenantId);
    List<CivicAsset> findAllByNextMaintenanceDate(java.time.LocalDate date);
}
