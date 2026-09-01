package com.govos.core.presentation.map;

import com.govos.core.application.map.MapService;
import com.govos.core.domain.map.GeoFeature;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    /**
     * Returns real GeoFeature pins from complaints and assets for the authenticated tenant.
     * Previously was hardcoded — now DB-backed via MapService.
     */
    @GetMapping("/features")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN','ROLE_DEPT_HEAD','ROLE_REP','ROLE_OFFICER')")
    public ResponseEntity<List<GeoFeature>> listFeatures(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(mapService.getFeatures(tenantId));
    }
}
