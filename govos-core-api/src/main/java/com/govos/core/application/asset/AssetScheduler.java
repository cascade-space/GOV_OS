package com.govos.core.application.asset;

import com.govos.core.application.complaint.EventPublisher;
import com.govos.core.domain.asset.AssetRepository;
import com.govos.core.domain.asset.CivicAsset;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetScheduler {

    private final JdbcTemplate jdbcTemplate;
    private final AssetRepository assetRepository;
    private final EventPublisher eventPublisher;

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void scheduleAssetMaintenanceNotifications() {
        log.info("Starting daily asset maintenance check...");

        List<UUID> tenantIds = jdbcTemplate.queryForList("SELECT id FROM tenants WHERE is_active = true", UUID.class);
        
        LocalDate targetDate = LocalDate.now().plusDays(7);

        int totalDue = 0;

        for (UUID tenantId : tenantIds) {
            // Bypass RLS dynamically by pretending to be in this tenant context
            jdbcTemplate.update("SET LOCAL app.tenant_id = ?", tenantId.toString());
            
            List<CivicAsset> dueAssets = assetRepository.findAllByNextMaintenanceDate(targetDate);
            
            for (CivicAsset asset : dueAssets) {
                log.info("Asset maintenance due in 7 days: {} (Tenant: {})", asset.getAssetId(), tenantId);
                eventPublisher.publishAssetMaintenanceDue(asset);
                totalDue++;
            }
        }
        
        log.info("Asset maintenance check completed. Published {} events.", totalDue);
    }
}
