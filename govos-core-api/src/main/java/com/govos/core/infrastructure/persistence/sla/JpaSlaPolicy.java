package com.govos.core.infrastructure.persistence.sla;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sla_policies")
@Getter
@Setter
@NoArgsConstructor
public class JpaSlaPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority;

    @Column(name = "resolution_hours", nullable = false)
    private int resolutionHours;

    @Column(name = "warning_threshold_ratio", nullable = false)
    private double warningThresholdRatio = 0.75;

    @Column(name = "escalation_level_1_hours", nullable = false)
    private int escalationLevel1Hours = 24;

    @Column(name = "escalation_level_2_hours", nullable = false)
    private int escalationLevel2Hours = 48;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
