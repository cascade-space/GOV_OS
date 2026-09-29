package com.govos.core.presentation.complaint;

import com.govos.core.application.admin.AuditService;
import com.govos.core.application.complaint.ComplaintService;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.complaint.ComplaintStatus;
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
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintDtos.CreateComplaintRequest request,
            Authentication auth
    ) {
        // Extract tenantId and userId from JWT claims mapping (simulated here)
        // In reality, JwtAuthFilter sets authorities or details.
        // For vertical slice, we parse it from the token details we set in filter
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        UUID reporterId = UUID.fromString(auth.getPrincipal().toString());

        Complaint complaint = complaintService.createComplaint(
                tenantId,
                reporterId,
                request.title(),
                request.description(),
                request.latitude(),
                request.longitude()
        );

        return ResponseEntity.ok(complaint);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER', 'ROLE_REP')")
    public ResponseEntity<List<Complaint>> listComplaints(
            @RequestParam(required = false) UUID wardId,
            Authentication auth
    ) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();

        List<Complaint> complaints;
        if (wardId != null) {
            complaints = complaintService.listByWard(tenantId, wardId);
        } else {
            complaints = complaintService.listByTenant(tenantId);
        }
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER', 'ROLE_REP', 'ROLE_CITIZEN')")
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable String id,
            Authentication auth
    ) {
        Complaint complaint = null;
        if (id.toUpperCase().startsWith("CMP-")) {
            complaint = complaintService.findByComplaintNumber(id).orElse(null);
        } else {
            try {
                UUID uuid = UUID.fromString(id);
                complaint = complaintService.findById(uuid).orElse(null);
            } catch (IllegalArgumentException ignored) {
                complaint = complaintService.findByComplaintNumber(id).orElse(null);
            }
        }

        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(complaint);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ComplaintDtos.UpdateStatusRequest request
    ) {
        ComplaintStatus newStatus = ComplaintStatus.valueOf(request.status().toUpperCase());
        Complaint updated = complaintService.updateStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<Complaint> assignComplaint(
            @PathVariable UUID id,
            @Valid @RequestBody ComplaintDtos.AssignComplaintRequest request,
            Authentication auth
    ) {
        UUID adminId = UUID.fromString(auth.getPrincipal().toString());
        Complaint updated = complaintService.assignComplaint(id, request.officerId(), adminId);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/start-work")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")
    public ResponseEntity<Complaint> startWork(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID officerId = UUID.fromString(auth.getPrincipal().toString());
        Complaint updated = complaintService.startWork(id, officerId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/complete-work")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")
    public ResponseEntity<Complaint> completeWork(
            @PathVariable UUID id,
            @Valid @RequestBody ComplaintDtos.CompleteWorkRequest request,
            Authentication auth
    ) {
        UUID officerId = UUID.fromString(auth.getPrincipal().toString());
        Complaint updated = complaintService.completeWork(
                id,
                officerId,
                request.resolutionNotes(),
                request.resolutionEvidenceUrl(),
                request.resolutionLatitude(),
                request.resolutionLongitude()
        );
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/request-rework")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<Complaint> requestRework(
            @PathVariable UUID id,
            @Valid @RequestBody ComplaintDtos.RequestReworkRequest request,
            Authentication auth
    ) {
        UUID verifierId = UUID.fromString(auth.getPrincipal().toString());
        Complaint updated = complaintService.requestRework(id, verifierId, request.reworkReason());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/verify-close")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<Complaint> verifyAndClose(
            @PathVariable UUID id,
            @RequestBody(required = false) ComplaintDtos.VerifyCloseRequest request,
            Authentication auth
    ) {
        UUID adminId = UUID.fromString(auth.getPrincipal().toString());
        String notes = request != null ? request.notes() : null;
        Complaint updated = complaintService.verifyAndClose(id, adminId, notes);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/assigned/me")
    @PreAuthorize("hasAnyAuthority('ROLE_OFFICER', 'ROLE_TENANT_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<Complaint>> listMyAssignedComplaints(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        UUID officerId = UUID.fromString(auth.getPrincipal().toString());

        List<Complaint> complaints = complaintService.listAssignedToOfficer(tenantId, officerId);
        return ResponseEntity.ok(complaints);
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_CITIZEN', 'ROLE_TENANT_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<Complaint>> listMyComplaints(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID citizenId = UUID.fromString(auth.getPrincipal().toString());

        List<Complaint> complaints = complaintService.listByReporterId(citizenId);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Returns the full audit timeline for a complaint by its UUID or complaint number.
     * Used by officers and admins to view the complete history, including pre-rework events.
     */
    @GetMapping("/{id}/timeline")
    @PreAuthorize("hasAnyAuthority('ROLE_OFFICER', 'ROLE_TENANT_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_REP')")
    public ResponseEntity<List<AuditService.TimelineEventDto>> getComplaintTimeline(
            @PathVariable String id
    ) {
        List<AuditService.TimelineEventDto> timeline = auditService.getTimelineForResource(id);
        return ResponseEntity.ok(timeline);
    }

    /**
     * REP-only: list complaints for a specific constituency (read-only).
     * MLA staff can use this to drive their constituency dashboard.
     */
    @GetMapping("/constituency/{constituency}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_REP')")
    public ResponseEntity<List<Complaint>> listByConstituency(
            @PathVariable String constituency,
            Authentication auth
    ) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        List<Complaint> complaints = complaintService.listByConstituency(tenantId, constituency);
        return ResponseEntity.ok(complaints);
    }
}
