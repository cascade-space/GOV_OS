package com.govos.core.application.asset;

import com.govos.core.domain.asset.AssetRepository;
import com.govos.core.domain.asset.CivicAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;

    @Transactional(readOnly = true)
    public List<CivicAsset> listAssets(UUID tenantId) {
        return assetRepository.findAllByTenantId(tenantId);
    }

    public CivicAsset createAsset(UUID tenantId, CivicAsset dto) {
        CivicAsset asset = CivicAsset.builder()
                .tenantId(tenantId)
                .assetId(dto.getAssetId())
                .name(dto.getName())
                .category(dto.getCategory())
                .status(dto.getStatus())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .nextMaintenanceDate(dto.getNextMaintenanceDate())
                .build();
        return assetRepository.save(asset);
    }
    public CivicAsset updateAsset(UUID tenantId, UUID assetId, CivicAsset dto) {
        CivicAsset asset = assetRepository.findByIdAndTenantId(assetId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        asset.setAssetId(dto.getAssetId());
        asset.setName(dto.getName());
        asset.setCategory(dto.getCategory());
        asset.setStatus(dto.getStatus());
        asset.setLatitude(dto.getLatitude());
        asset.setLongitude(dto.getLongitude());
        asset.setNextMaintenanceDate(dto.getNextMaintenanceDate());
        return assetRepository.save(asset);
    }

    public void deleteAsset(UUID tenantId, UUID assetId) {
        CivicAsset asset = assetRepository.findByIdAndTenantId(assetId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        asset.setDeleted(true);
        assetRepository.save(asset);
    }
}
