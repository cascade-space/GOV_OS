package com.govos.core.presentation.document;

import com.govos.core.application.document.DocumentService;
import com.govos.core.domain.document.DocumentMovement;
import com.govos.core.domain.document.GovDocument;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA')")
    public ResponseEntity<List<GovDocument>> listDocuments(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(documentService.listDocuments(tenantId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA')")
    public ResponseEntity<GovDocument> getDocument(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(documentService.getDocument(tenantId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA')")
    public ResponseEntity<GovDocument> createDocument(@RequestBody GovDocument dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(documentService.createDocument(tenantId, dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER')")
    public ResponseEntity<GovDocument> updateDocument(@PathVariable UUID id, @RequestBody GovDocument dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(documentService.updateDocument(tenantId, id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        documentService.deleteDocument(tenantId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/route")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER')")
    public ResponseEntity<GovDocument> routeDocument(
            @PathVariable UUID id,
            @RequestBody RouteRequest request,
            Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        UUID officerId = details.userId();
        return ResponseEntity.ok(documentService.routeDocument(
                tenantId, id, request.getCurrentDesk(), request.getTargetDesk(),
                request.getNotes(), request.isUrgent(), officerId));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER')")
    public ResponseEntity<GovDocument> receiveDocument(
            @PathVariable UUID id,
            @RequestBody ReceiveRequest request,
            Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        UUID officerId = details.userId();
        return ResponseEntity.ok(documentService.receiveDocument(
                tenantId, id, request.getTargetDesk(), request.getRemarks(), officerId));
    }

    @PostMapping("/{id}/hearing")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA')")
    public ResponseEntity<GovDocument> scheduleHearing(
            @PathVariable UUID id,
            @RequestBody HearingRequest request,
            Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(documentService.scheduleHearing(
                tenantId, id, request.getHearingDate(), request.getBenchOfficer(), request.getSummary()));
    }

    @GetMapping("/{id}/movements")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA')")
    public ResponseEntity<List<DocumentMovement>> listMovements(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(documentService.listMovements(tenantId, id));
    }

    @Data
    public static class RouteRequest {
        private String currentDesk;
        private String targetDesk;
        private String notes;
        private boolean urgent;
    }

    @Data
    public static class ReceiveRequest {
        private String targetDesk;
        private String remarks;
    }

    @Data
    public static class HearingRequest {
        private Instant hearingDate;
        private String benchOfficer;
        private String summary;
    }
}
