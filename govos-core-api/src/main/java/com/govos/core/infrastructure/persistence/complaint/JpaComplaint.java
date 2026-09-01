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
}
