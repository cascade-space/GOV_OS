package com.govos.core.infrastructure.persistence.directive;

import com.govos.core.domain.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "mla_directives")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class JpaMlaDirective extends BaseEntity {

    @Column(name = "complaint_id")
    private UUID complaintId;

    @Column(name = "mla_name", nullable = false)
    private String mlaName;

    @Column(name = "constituency", nullable = false)
    private String constituency;

    @Column(name = "directive_type", nullable = false)
    private String directiveType;

    @Column(name = "instruction_notes", columnDefinition = "TEXT", nullable = false)
    private String instructionNotes;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";
}
