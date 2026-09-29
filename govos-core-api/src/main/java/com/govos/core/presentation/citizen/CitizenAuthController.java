package com.govos.core.presentation.citizen;

import com.govos.core.application.complaint.ComplaintService;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Authenticated Citizen Portal -- JWT-protected endpoints.
 * All operations require ROLE_CITIZEN in the JWT.
 * Route: /api/v1/citizen/me/*
 */
@RestController
@RequestMapping("/api/v1/citizen/me")
@RequiredArgsConstructor
@Slf4j
public class CitizenAuthController {

    private final ComplaintService complaintService;

    /**
     * Submit a new complaint as an authenticated citizen.
     * Binds complaint to the authenticated userId -- no mobile needed.
     */
    @PostMapping("/complaints")
    @PreAuthorize("hasAnyAuthority('ROLE_CITIZEN', 'ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<Complaint> submitComplaint(
            @RequestBody CitizenComplaintRequest request,
            Authentication auth
    ) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        UUID citizenId = details.userId();

        Complaint complaint = complaintService.createComplaint(
                tenantId, citizenId,
                request.title(), request.description(),
                request.latitude(), request.longitude()
        );
        log.info("Authenticated citizen {} submitted complaint {}", citizenId, complaint.getComplaintNumber());
        return ResponseEntity.ok(complaint);
    }

    /**
     * List all complaints submitted by the authenticated citizen.
     */
    @GetMapping("/complaints")
    @PreAuthorize("hasAnyAuthority('ROLE_CITIZEN', 'ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER')")
    public ResponseEntity<List<Complaint>> listMyComplaints(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID citizenId = details.userId();
        List<Complaint> complaints = complaintService.listByReporterId(citizenId);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Get a single complaint by complaint number -- validates it belongs to the citizen.
     */
    @GetMapping("/complaints/{complaintNumber}")
    @PreAuthorize("hasAnyAuthority('ROLE_CITIZEN', 'ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN')")
    public ResponseEntity<Complaint> getMyComplaint(
            @PathVariable String complaintNumber,
            Authentication auth
    ) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID citizenId = details.userId();
        String role = details.role();

        Complaint complaint = complaintService.findByComplaintNumber(complaintNumber)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintNumber));

        // CITIZEN can only view their own complaint -- enforced here, not just at DB level
        if ("CITIZEN".equals(role) && !citizenId.equals(complaint.getReporterId())) {
            throw new SecurityException("Access denied: This complaint does not belong to you.");
        }
        return ResponseEntity.ok(complaint);
    }

    // Request DTO
    public record CitizenComplaintRequest(
            String title,
            String description,
            Double latitude,
            Double longitude,
            String locationAddress,
            String subCategory
    ) {}
}
