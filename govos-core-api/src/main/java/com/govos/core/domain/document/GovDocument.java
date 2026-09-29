package com.govos.core.domain.document;

import com.govos.core.domain.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "documents")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class GovDocument extends BaseEntity {

    @Column(name = "document_number", nullable = false, length = 50)
    private String documentNumber; // E.g. DOC-2023-001

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // LETTER, NOTICE, INTERNAL_MEMO, TENDER

    @Column(name = "status", nullable = false, length = 50)
    private String status; // DRAFT, IN_TRANSIT, DELIVERED, ARCHIVED

    @Column(name = "current_desk", length = 255)
    private String currentDesk; // The officer/dept currently holding it

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "directive_id")
    private java.util.UUID directiveId;

    @Column(name = "complaint_id")
    private java.util.UUID complaintId;

    @Column(name = "department_id")
    private java.util.UUID departmentId;

    @Column(name = "priority", length = 20)
    @Builder.Default
    private String priority = "NORMAL"; // NORMAL, URGENT, IMMEDIATE

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Column(name = "next_hearing_date")
    private java.time.Instant nextHearingDate;

    @Column(name = "hearing_bench_officer", length = 255)
    private String hearingBenchOfficer;

    @Column(name = "hearing_summary")
    private String hearingSummary;

    @Column(name = "hearing_order_url")
    private String hearingOrderUrl;

    public void routeTo(String targetDesk) {
        if (!"DRAFT".equals(this.status) && !"RECEIVED".equals(this.status) && !"IN_TRANSIT".equals(this.status)) {
            throw new IllegalStateException("Document cannot be routed from current state: " + this.status);
        }
        this.status = "IN_TRANSIT";
        this.currentDesk = targetDesk;
    }

    public void receiveAtDesk() {
        this.status = "RECEIVED";
        this.receivedDate = LocalDate.now();
    }

    public void scheduleHearing(java.time.Instant hearingDate, String benchOfficer, String summary) {
        this.nextHearingDate = hearingDate;
        this.hearingBenchOfficer = benchOfficer;
        this.hearingSummary = summary;
    }

    public void recordHearingOrder(String orderUrl, String summary) {
        this.hearingOrderUrl = orderUrl;
        if (summary != null && !summary.isBlank()) {
            this.hearingSummary = summary;
        }
    }

    public void archive() {
        this.status = "ARCHIVED";
    }
}
