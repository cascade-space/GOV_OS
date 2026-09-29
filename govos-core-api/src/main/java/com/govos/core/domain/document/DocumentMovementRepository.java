package com.govos.core.domain.document;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentMovementRepository {
    List<DocumentMovement> findAllByDocumentIdOrderByDispatchedAtDesc(UUID documentId);
    List<DocumentMovement> findAllByTenantId(UUID tenantId);
    Optional<DocumentMovement> findTopByDocumentIdOrderByDispatchedAtDesc(UUID documentId);
    DocumentMovement save(DocumentMovement movement);
}
