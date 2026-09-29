package com.govos.core.presentation.asset;

import com.govos.core.application.asset.AssetService;
import com.govos.core.domain.asset.CivicAsset;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;
    private static final UUID DEFAULT_TENANT_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    @GetMapping("/public")
    public ResponseEntity<List<CivicAsset>> listPublicAssets(@RequestParam(required = false) UUID tenantId) {
        UUID effectiveTenant = tenantId != null ? tenantId : DEFAULT_TENANT_ID;
        return ResponseEntity.ok(assetService.listAssets(effectiveTenant));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA')")
    public ResponseEntity<List<CivicAsset>> listAssets(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(assetService.listAssets(tenantId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA')")
    public ResponseEntity<CivicAsset> getAsset(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(assetService.getAsset(tenantId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD')")
    public ResponseEntity<CivicAsset> createAsset(@RequestBody CivicAsset dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(assetService.createAsset(tenantId, dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD')")
    public ResponseEntity<CivicAsset> updateAsset(@PathVariable UUID id, @RequestBody CivicAsset dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(assetService.updateAsset(tenantId, id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD')")
    public ResponseEntity<Void> deleteAsset(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        assetService.deleteAsset(tenantId, id);
        return ResponseEntity.noContent().build();
    }
}
