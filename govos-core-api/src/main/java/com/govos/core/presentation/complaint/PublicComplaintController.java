package com.govos.core.presentation.complaint;

import com.govos.core.application.complaint.ComplaintService;
import com.govos.core.domain.complaint.Complaint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

/**
 * Public (unauthenticated) Complaint API for the Citizen Landing Portal.
 *
 * Endpoints:
 *   POST  /api/v1/public/complaints   — Submit a complaint without a JWT
 *   GET   /api/v1/public/complaints/{complaintNumber} — Track a complaint (safe fields only)
 *
 * Security: permitted by SecurityConfig. Rate-limited at Nginx level (5 req/min per IP).
 * Tenant: resolved from GPS via AI geo-service; falls back to default dev tenant.
 */
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Slf4j
public class PublicComplaintController {

    private final ComplaintService complaintService;
    private final com.govos.core.domain.auth.UserRepository userRepository;

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public record PublicSubmitRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Mobile is required")
            @Pattern(regexp = "^[0-9]{10}$", message = "Enter a valid 10-digit mobile number")
            String mobile,
            @NotBlank(message = "Title is required") String title,
            @NotBlank(message = "Description is required") String description,
            @NotNull(message = "Latitude is required") Double latitude,
            @NotNull(message = "Longitude is required") Double longitude,
            String locationAddress,
            String subCategory
    ) {}

    public record PublicSubmitResponse(
            String complaintNumber,
            String status,
            String message,
            String estimatedResolutionHours
    ) {}

    public record PublicTrackResponse(
            String complaintNumber,
            String status,
            String category,
            String priority,
            String assignedDepartment,
            String locationAddress,
            String createdAt,
            String updatedAt
    ) {}

    // ── Endpoints ─────────────────────────────────────────────────────────────

    /**
     * Submit a new public complaint from the citizen portal.
     * No JWT required — citizens are identified by mobile number only.
     */
    @PostMapping("/complaints")
    public ResponseEntity<PublicSubmitResponse> submitPublicComplaint(
            @Valid @RequestBody PublicSubmitRequest request
    ) {
        log.info("Public complaint submission from mobile={} for location=({},{})",
                maskMobile(request.mobile()), request.latitude(), request.longitude());

        Complaint complaint = complaintService.createPublicComplaint(
                request.name(),
                request.mobile(),
                request.title(),
                request.description(),
                request.latitude(),
                request.longitude(),
                request.locationAddress(),
                request.subCategory()
        );

        return ResponseEntity.ok(new PublicSubmitResponse(
                complaint.getComplaintNumber(),
                complaint.getStatus().name(),
                "Your complaint has been submitted successfully. You will receive updates on your mobile.",
                "72 hours"
        ));
    }

    /**
     * Get all complaints for the logged-in citizen.
     */
    @GetMapping("/complaints/my")
    public ResponseEntity<java.util.List<PublicTrackResponse>> getMyComplaints(
            @org.springframework.security.core.annotation.AuthenticationPrincipal String userId
    ) {
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        com.govos.core.domain.auth.User user = userRepository.findById(java.util.UUID.fromString(userId))
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("User not found"));
                
        java.util.List<Complaint> myComplaints = complaintService.listByReporterMobile(user.getPhone());
        
        java.util.List<PublicTrackResponse> response = myComplaints.stream()
                .map(c -> new PublicTrackResponse(
                        c.getComplaintNumber(),
                        c.getStatus().name(),
                        c.getCategory(),
                        c.getPriority().name(),
                        "Pending", // Simplify for now
                        "Location", // Simplify for now
                        c.getCreatedAt() != null ? c.getCreatedAt().toString() : "",
                        c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : ""
                ))
                .toList();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Track a complaint by its public complaint number.
     * Returns only safe, non-PII fields.
     */
    @GetMapping("/complaints/{complaintNumber}")
    public ResponseEntity<?> trackComplaint(@PathVariable String complaintNumber) {
        return complaintService.findByComplaintNumber(complaintNumber)
                .map(c -> ResponseEntity.ok(new PublicTrackResponse(
                        c.getComplaintNumber(),
                        c.getStatus() != null ? c.getStatus().name() : "NEW",
                        c.getCategory(),
                        c.getPriority() != null ? c.getPriority().name() : "MEDIUM",
                        c.getAssignedToId() != null ? "Assigned" : "Pending Assignment",
                        c.getLocationAddress(),
                        c.getCreatedAt() != null ? c.getCreatedAt().toString() : null,
                        c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    private String maskMobile(String mobile) {
        if (mobile == null || mobile.length() < 4) return "****";
        return "******" + mobile.substring(mobile.length() - 4);
    }
}
