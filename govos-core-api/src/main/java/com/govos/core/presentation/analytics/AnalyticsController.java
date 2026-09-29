package com.govos.core.presentation.analytics;

import com.govos.core.application.analytics.AnalyticsService;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Role-scoped analytics summary.
     *
     * SUPER_ADMIN   → full platform view (all tenants via cross-tenant mode, or single tenant)
     * TENANT_ADMIN  → full tenant-level stats
     * REP           → constituency-scoped summary (pass constituency param)
     * OFFICER       → ward-scoped summary (ward_id from JWT wid claim)
     *
     * Note: ROLE_DEPT_HEAD removed — this code is never issued in JWT (JwtTokenProvider
     * only issues SUPER_ADMIN, TENANT_ADMIN, OFFICER, REP, CITIZEN). DEPT_HEAD exists
     * only in the DB roles table as a future placeholder; it maps to OFFICER for now.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN','ROLE_OFFICER','ROLE_REP')")
    public ResponseEntity<Map<String, Object>> getSummary(
            Authentication auth,
            @RequestParam(required = false) String constituency
    ) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        String role = details.role();
        UUID wardId = details.wardId();

        return switch (role) {
            case "OFFICER" -> {
                // Ward-scoped: officer sees only their ward's stats
                if (wardId != null) {
                    yield ResponseEntity.ok(analyticsService.getWardSummary(tenantId, wardId));
                }
                // Fallback: officer with no ward assigned gets tenant summary
                yield ResponseEntity.ok(analyticsService.getSummary(tenantId));
            }
            case "REP" -> {
                // Constituency-scoped: MLA sees their constituency's complaints
                String cons = constituency != null ? constituency : "";
                yield ResponseEntity.ok(analyticsService.getConstituencySummary(tenantId, cons));
            }
            default ->
                // TENANT_ADMIN and SUPER_ADMIN: full tenant summary
                ResponseEntity.ok(analyticsService.getSummary(tenantId));
        };
    }
}

