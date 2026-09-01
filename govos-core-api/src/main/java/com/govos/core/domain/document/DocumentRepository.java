package com.govos.core.domain.document;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository {
    List<GovDocument> findAllByTenantId(UUID tenantId);
    Optional<GovDocument> findByIdAndTenantId(UUID id, UUID tenantId);
    GovDocument save(GovDocument document);
    void delete(GovDocument document);
    long countByTenantId(UUID tenantId);
}
