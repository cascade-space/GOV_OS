package com.govos.core.presentation.directive;

import com.govos.core.application.directive.MlaDirectiveService;
import com.govos.core.domain.directive.MlaDirective;
import com.govos.core.presentation.auth.JwtAuthFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mla/directives")
@RequiredArgsConstructor
public class MlaDirectiveController {

    private final MlaDirectiveService directiveService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<MlaDirective> issueDirective(
            @Valid @RequestBody MlaDirectiveDtos.IssueDirectiveRequest request,
            Authentication auth
    ) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        UUID userId = UUID.fromString(auth.getPrincipal().toString());

        MlaDirective created = directiveService.issueDirective(
                tenantId,
                request.complaintId(),
                request.mlaName(),
                request.constituency(),
                request.directiveType(),
                request.instructionNotes(),
                userId
        );

        return ResponseEntity.ok(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")
    public ResponseEntity<List<MlaDirective>> listDirectives(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();

        List<MlaDirective> list = directiveService.listByTenant(tenantId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/complaint/{complaintId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")
    public ResponseEntity<List<MlaDirective>> listByComplaint(@PathVariable UUID complaintId) {
        List<MlaDirective> list = directiveService.listByComplaint(complaintId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/constituency/{constituency}")
    public ResponseEntity<List<MlaDirective>> listByConstituency(
            @PathVariable String constituency,
            Authentication auth
    ) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();

        List<MlaDirective> list = directiveService.listByConstituency(tenantId, constituency);
        return ResponseEntity.ok(list);
    }
}
