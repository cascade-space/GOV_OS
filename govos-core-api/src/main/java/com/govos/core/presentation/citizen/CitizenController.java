package com.govos.core.presentation.citizen;

import com.govos.core.application.citizen.CitizenService;
import com.govos.core.domain.auth.User;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/citizens")
@RequiredArgsConstructor
public class CitizenController {

    private final CitizenService citizenService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")
    public ResponseEntity<List<com.govos.core.application.auth.dto.AuthDtos.UserProfileDto>> listCitizens(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        List<com.govos.core.application.auth.dto.AuthDtos.UserProfileDto> citizens = citizenService.listCitizens(tenantId).stream()
            .map(u -> new com.govos.core.application.auth.dto.AuthDtos.UserProfileDto(
                u.getId().toString(),
                u.getFullName(),
                u.getDisplayName(),
                u.getEmail(),
                u.getPhone(),
                u.getAvatarUrl(),
                u.getRoles().isEmpty() ? null : u.getRoles().iterator().next().getCode(),
                u.getWardId() != null ? u.getWardId().toString() : null,
                u.getDepartmentId() != null ? u.getDepartmentId().toString() : null,
                u.isTotpEnabled()
            ))
            .toList();
        return ResponseEntity.ok(citizens);
    }

    /**
     * Create a citizen account. OFFICER is intentionally excluded — only admins
     * can create accounts for citizens to prevent unauthorized account provisioning.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<User> createCitizen(@RequestBody User dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(citizenService.createCitizen(tenantId, dto));
    }
    /**
     * Update a citizen profile. OFFICER excluded — only admins can modify citizen records.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<User> updateCitizen(@PathVariable UUID id, @RequestBody User dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(citizenService.updateCitizen(tenantId, id, dto));
    }

    /**
     * SECURITY FIX: ROLE_OFFICER removed from DELETE.
     * Previously any field officer could delete citizen accounts — this was a critical bug.
     * Only TENANT_ADMIN and SUPER_ADMIN can deactivate (soft-delete) citizens.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<Void> deleteCitizen(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        citizenService.deleteCitizen(tenantId, id);
        return ResponseEntity.noContent().build();
    }
}
