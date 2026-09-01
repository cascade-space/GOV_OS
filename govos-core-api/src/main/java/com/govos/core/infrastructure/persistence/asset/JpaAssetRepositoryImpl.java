package com.govos.core.infrastructure.persistence.asset;

import com.govos.core.domain.asset.AssetRepository;
import com.govos.core.domain.asset.CivicAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaAssetRepositoryImpl implements AssetRepository {

    private final SpringDataAssetRepository springDataAssetRepository;

    @Override
    public List<CivicAsset> findAllByTenantId(UUID tenantId) {
        return springDataAssetRepository.findAllByTenantId(tenantId);
    }

    @Override
    public Optional<CivicAsset> findByIdAndTenantId(UUID id, UUID tenantId) {
        return springDataAssetRepository.findByIdAndTenantId(id, tenantId);
    }

    @Override
    public CivicAsset save(CivicAsset asset) {
        return springDataAssetRepository.save(asset);
    }

    @Override
    public void delete(CivicAsset asset) {
        asset.setDeleted(true);
        springDataAssetRepository.save(asset);
    }

    @Override
    public long countByTenantId(UUID tenantId) {
        return springDataAssetRepository.countByTenantId(tenantId);
    }

    @Override
    public List<CivicAsset> findAllByNextMaintenanceDate(java.time.LocalDate date) {
        return springDataAssetRepository.findAllByNextMaintenanceDate(date);
    }
}
