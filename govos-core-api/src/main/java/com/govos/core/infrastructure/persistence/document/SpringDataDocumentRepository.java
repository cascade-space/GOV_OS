package com.govos.core.infrastructure.persistence.document;

import com.govos.core.domain.document.GovDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataDocumentRepository extends JpaRepository<GovDocument, UUID> {
    List<GovDocument> findAllByTenantId(UUID tenantId);
    Optional<GovDocument> findByIdAndTenantId(UUID id, UUID tenantId);
    long countByTenantId(UUID tenantId);
}
