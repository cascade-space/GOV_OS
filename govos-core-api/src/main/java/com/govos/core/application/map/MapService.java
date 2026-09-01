package com.govos.core.application.map;

import com.govos.core.domain.asset.AssetRepository;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.map.GeoFeature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapService {

    private final ComplaintRepository complaintRepository;
    private final AssetRepository assetRepository;

    /**
     * Aggregates map pins from complaints (with GPS) and assets for a given tenant.
     * Projects are not mapped because CivicProject has no GPS columns.
     */
    public List<GeoFeature> getFeatures(UUID tenantId) {
        List<GeoFeature> features = new ArrayList<>();

        // Complaints with GPS coordinates
        complaintRepository.findByTenantId(tenantId).stream()
                .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
                .forEach(c -> {
                    GeoFeature f = new GeoFeature();
                    f.setId(c.getId());
                    f.setTenantId(tenantId);
                    f.setType("COMPLAINT");
                    f.setTitle(c.getTitle());
                    f.setLatitude(c.getLatitude());
                    f.setLongitude(c.getLongitude());
                    // Map priority to severity label
                    String priority = c.getPriority() != null ? c.getPriority().name() : "MEDIUM";
                    f.setSeverity(priority.equals("CRITICAL") || priority.equals("HIGH") ? "HIGH"
                            : priority.equals("LOW") ? "LOW" : "MEDIUM");
                    features.add(f);
                });

        // Assets with GPS coordinates
        assetRepository.findAllByTenantId(tenantId).stream()
                .filter(a -> a.getLatitude() != null && a.getLongitude() != null)
                .forEach(a -> {
                    GeoFeature f = new GeoFeature();
                    f.setId(a.getId());
                    f.setTenantId(tenantId);
                    f.setType("ASSET");
                    f.setTitle(a.getName());
                    f.setLatitude(a.getLatitude());
                    f.setLongitude(a.getLongitude());
                    f.setSeverity("MAINTENANCE".equals(a.getStatus()) ? "HIGH" : "LOW");
                    features.add(f);
                });

        return features;
    }
}
