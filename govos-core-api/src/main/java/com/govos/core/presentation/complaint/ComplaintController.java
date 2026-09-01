package com.govos.core.presentation.complaint;

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
    public ResponseEntity<List<Complaint>> listComplaints(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        
        List<Complaint> complaints = complaintService.listByTenant(tenantId);
        return ResponseEntity.ok(complaints);
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
}
