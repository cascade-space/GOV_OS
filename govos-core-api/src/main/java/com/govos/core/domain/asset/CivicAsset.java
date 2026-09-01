package com.govos.core.domain.asset;

import com.govos.core.domain.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "civic_assets")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CivicAsset extends BaseEntity {

    @Column(name = "asset_id", nullable = false, length = 50)
    private String assetId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "category", nullable = false, length = 50)
    private String category; // VEHICLE, BUILDING, STREETLIGHT

    @Column(name = "status", nullable = false, length = 50)
    private String status; // ACTIVE, MAINTENANCE, DECOMMISSIONED

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;
}
