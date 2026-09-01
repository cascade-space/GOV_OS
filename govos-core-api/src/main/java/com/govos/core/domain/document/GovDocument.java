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

    public void routeTo(String targetDesk) {
        if (!"DRAFT".equals(this.status) && !"RECEIVED".equals(this.status)) {
            throw new IllegalStateException("Document must be DRAFT or RECEIVED before routing. Current state: " + this.status);
        }
        this.status = "IN_TRANSIT";
        this.currentDesk = targetDesk;
    }

    public void receiveAtDesk() {
        if (!"IN_TRANSIT".equals(this.status)) {
            throw new IllegalStateException("Document must be IN_TRANSIT to be received. Current state: " + this.status);
        }
        this.status = "RECEIVED";
        this.receivedDate = LocalDate.now();
    }

    public void archive() {
        if (!"RECEIVED".equals(this.status)) {
            throw new IllegalStateException("Document must be RECEIVED to be archived. Current state: " + this.status);
        }
        this.status = "ARCHIVED";
    }
}
