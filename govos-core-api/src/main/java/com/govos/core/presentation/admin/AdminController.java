package com.govos.core.presentation.admin;

import com.govos.core.application.admin.AuditService;
import com.govos.core.domain.admin.AuditLog;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuditService auditService;
    private final com.govos.core.domain.auth.UserRepository userRepository;
    private final com.govos.core.infrastructure.persistence.auth.TenantJpaRepository tenantRepository;

    /**
     * Returns the most recent 100 audit log entries for the authenticated tenant.
     * Formerly returned hardcoded stubs — now DB-backed via AuditService + SpringDataAuditLogRepository.
     */
    @GetMapping("/audit")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN')")
    public ResponseEntity<List<AuditLog>> listAuditLogs(
            Authentication auth,
            @RequestParam(defaultValue = "100") int limit) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(auditService.findRecent(tenantId, Math.min(limit, 500)));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN')")
    public ResponseEntity<List<com.govos.core.application.auth.dto.AuthDtos.UserProfileDto>> listUsers(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        List<com.govos.core.application.auth.dto.AuthDtos.UserProfileDto> users = userRepository.findByTenantId(tenantId).stream()
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
        return ResponseEntity.ok(users);
    }

    @GetMapping("/tenant")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN')")
    public ResponseEntity<com.govos.core.application.auth.dto.AuthDtos.TenantDto> getTenantConfig(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        com.govos.core.domain.auth.Tenant t = tenantRepository.findById(tenantId).orElseThrow(() -> new RuntimeException("Tenant not found"));
        return ResponseEntity.ok(new com.govos.core.application.auth.dto.AuthDtos.TenantDto(
            t.getId().toString(),
            t.getName(),
            t.getCode(),
            t.getSubdomain(),
            t.getLogoUrl(),
            t.getPrimaryColor(),
            t.getTimezone(),
            t.getLocale(),
            t.isMfaRequired()
        ));
    }
}
