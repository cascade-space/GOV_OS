package com.govos.core.infrastructure.persistence.complaint;

import com.govos.core.domain.shared.BaseEntity;
import com.govos.core.domain.complaint.ComplaintStatus;
import com.govos.core.domain.complaint.Priority;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class JpaComplaint extends BaseEntity {

    @Column(name = "complaint_number", unique = true, nullable = false)
    private String complaintNumber;


    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    private Double latitude;
    private Double longitude;

    @Column(name = "ward_id")
    private UUID wardId;

    @Column(name = "assigned_to_id")
    private UUID assignedToId;

    @Column(name = "ai_assessed_at")
    private Instant aiAssessedAt;

    // Public portal fields
    @Column(name = "reporter_name")
    private String reporterName;

    @Column(name = "reporter_mobile")
    private String reporterMobile;

    @Column(name = "source", nullable = false)
    private String source = "INTERNAL";

    @Column(name = "sub_category")
    private String subCategory;

    @Column(name = "location_address", columnDefinition = "TEXT")
    private String locationAddress;

    // Officer task execution & resolution fields
    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "resolution_evidence_url", columnDefinition = "TEXT")
    private String resolutionEvidenceUrl;

    @Column(name = "work_started_at")
    private Instant workStartedAt;

    @Column(name = "work_completed_at")
    private Instant workCompletedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    // Milestone M5 Verification, Rework & Citizen Confirmation fields
    @Column(name = "rework_reason", columnDefinition = "TEXT")
    private String reworkReason;

    @Column(name = "rework_count", nullable = false)
    private int reworkCount = 0;

    @Column(name = "citizen_rating")
    private Integer citizenRating;

    @Column(name = "citizen_feedback", columnDefinition = "TEXT")
    private String citizenFeedback;

    @Column(name = "resolution_latitude")
    private Double resolutionLatitude;

    @Column(name = "resolution_longitude")
    private Double resolutionLongitude;

    @Column(name = "distance_deviation_meters")
    private Double distanceDeviationMeters;

    @Column(name = "auto_close_at")
    private Instant autoCloseAt;

    // SLA & Escalation fields
    @Column(name = "sla_deadline")
    private Instant slaDeadline;

    @Column(name = "sla_breached", nullable = false)
    private boolean slaBreached = false;

    @Column(name = "sla_warning_sent", nullable = false)
    private boolean slaWarningSent = false;

    @Column(name = "escalation_level", nullable = false)
    private int escalationLevel = 0;

    // External Integration Hub fields (Milestone M8)
    @Column(name = "external_system", length = 50)
    private String externalSystem;

    @Column(name = "external_ticket_id", length = 100)
    private String externalTicketId;

    @Column(name = "integration_status", length = 30)
    private String integrationStatus = "NONE";

    @Column(name = "external_synced_at")
    private Instant externalSyncedAt;

    @Column(name = "last_external_status", length = 50)
    private String lastExternalStatus;

    // Milestone M9 Civic Assets & Projects
    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "project_id")
    private UUID projectId;
}
