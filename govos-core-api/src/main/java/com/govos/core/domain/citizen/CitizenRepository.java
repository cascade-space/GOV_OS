package com.govos.core.domain.citizen;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface CitizenRepository {
    CitizenProfile save(CitizenProfile citizen);
    Optional<CitizenProfile> findById(UUID id);
    Optional<CitizenProfile> findByUserId(UUID userId);
    List<CitizenProfile> findByTenantId(UUID tenantId);
}
