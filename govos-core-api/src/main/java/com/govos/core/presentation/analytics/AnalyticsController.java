package com.govos.core.presentation.analytics;

import com.govos.core.application.analytics.AnalyticsService;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Returns the full analytics report.
     * SUPER_ADMIN and TENANT_ADMIN see everything; OFFICER and DEPT_HEAD
     * receive the same payload (ward/dept scoping handled at UI layer).
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN','ROLE_DEPT_HEAD','ROLE_OFFICER')")
    public ResponseEntity<Map<String, Object>> getSummary(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(analyticsService.getSummary(tenantId));
    }
}
