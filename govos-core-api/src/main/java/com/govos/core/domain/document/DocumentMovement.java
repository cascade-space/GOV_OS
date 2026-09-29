package com.govos.core.domain.document;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document_movements")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    @Column(name = "from_desk", nullable = false, length = 100)
    private String fromDesk;

    @Column(name = "to_desk", nullable = false, length = 100)
    private String toDesk;

    @Column(name = "dispatched_at", nullable = false)
    @Builder.Default
    private Instant dispatchedAt = Instant.now();

    @Column(name = "received_at")
    private Instant receivedAt;

    @Column(name = "dispatch_notes", columnDefinition = "TEXT")
    private String dispatchNotes;

    @Column(name = "receipt_remarks", columnDefinition = "TEXT")
    private String receiptRemarks;

    @Column(name = "is_urgent")
    @Builder.Default
    private Boolean isUrgent = false;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
