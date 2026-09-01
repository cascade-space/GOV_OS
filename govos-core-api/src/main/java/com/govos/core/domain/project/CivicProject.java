package com.govos.core.domain.project;

import com.govos.core.domain.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "civic_projects")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CivicProject extends BaseEntity {

    @Column(name = "project_id", nullable = false, length = 50)
    private String projectId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // PLANNING, IN_PROGRESS, DELAYED, COMPLETED

    @Column(name = "budget")
    private Double budget;

    @Column(name = "spent")
    private Double spent;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "estimated_end_date")
    private LocalDate estimatedEndDate;

    @Builder.Default
    @Column(name = "completion_percentage", nullable = false)
    private int completionPercentage = 0;
}
