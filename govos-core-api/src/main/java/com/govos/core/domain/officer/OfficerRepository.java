package com.govos.core.domain.officer;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OfficerRepository {
    OfficerProfile save(OfficerProfile officer);
    Optional<OfficerProfile> findById(UUID id);
    List<OfficerProfile> findByTenantId(UUID tenantId);
    List<OfficerProfile> findAvailableOfficers(UUID tenantId);
}
