package com.govos.core.application.asset;

import com.govos.core.domain.asset.AssetRepository;
import com.govos.core.domain.asset.CivicAsset;
import com.govos.core.infrastructure.persistence.complaint.SpringDataComplaintRepository;
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
    private final SpringDataComplaintRepository complaintRepository;

    @Transactional(readOnly = true)
    public List<CivicAsset> listAssets(UUID tenantId) {
        List<CivicAsset> assets = assetRepository.findAllByTenantId(tenantId);
        for (CivicAsset asset : assets) {
            asset.setActiveComplaintsCount(complaintRepository.countActiveByAssetId(asset.getId()));
        }
        return assets;
    }

    @Transactional(readOnly = true)
    public CivicAsset getAsset(UUID tenantId, UUID assetId) {
        CivicAsset asset = assetRepository.findByIdAndTenantId(assetId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found with ID: " + assetId));
        asset.setActiveComplaintsCount(complaintRepository.countActiveByAssetId(asset.getId()));
        return asset;
    }

    public CivicAsset createAsset(UUID tenantId, CivicAsset dto) {
        CivicAsset asset = CivicAsset.builder()
                .tenantId(tenantId)
                .assetId(dto.getAssetId() != null ? dto.getAssetId() : "AST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .name(dto.getName())
                .category(dto.getCategory() != null ? dto.getCategory() : "STREETLIGHT")
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .nextMaintenanceDate(dto.getNextMaintenanceDate())
                .wardId(dto.getWardId())
                .departmentId(dto.getDepartmentId())
                .installationDate(dto.getInstallationDate())
                .manufacturer(dto.getManufacturer())
                .cost(dto.getCost())
                .build();
        return assetRepository.save(asset);
    }

    public CivicAsset updateAsset(UUID tenantId, UUID assetId, CivicAsset dto) {
        CivicAsset asset = assetRepository.findByIdAndTenantId(assetId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found with ID: " + assetId));
        asset.setAssetId(dto.getAssetId());
        asset.setName(dto.getName());
        asset.setCategory(dto.getCategory());
        asset.setStatus(dto.getStatus());
        asset.setLatitude(dto.getLatitude());
        asset.setLongitude(dto.getLongitude());
        asset.setNextMaintenanceDate(dto.getNextMaintenanceDate());
        asset.setWardId(dto.getWardId());
        asset.setDepartmentId(dto.getDepartmentId());
        asset.setInstallationDate(dto.getInstallationDate());
        asset.setManufacturer(dto.getManufacturer());
        asset.setCost(dto.getCost());
        return assetRepository.save(asset);
    }

    public void deleteAsset(UUID tenantId, UUID assetId) {
        CivicAsset asset = assetRepository.findByIdAndTenantId(assetId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found with ID: " + assetId));
        asset.setDeleted(true);
        assetRepository.save(asset);
    }
}
