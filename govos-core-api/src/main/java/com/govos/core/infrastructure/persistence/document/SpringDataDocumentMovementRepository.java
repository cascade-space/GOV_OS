package com.govos.core.infrastructure.persistence.document;

import com.govos.core.domain.document.DocumentMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataDocumentMovementRepository extends JpaRepository<DocumentMovement, UUID> {
    List<DocumentMovement> findAllByDocumentIdOrderByDispatchedAtDesc(UUID documentId);
    List<DocumentMovement> findAllByTenantId(UUID tenantId);
    Optional<DocumentMovement> findTopByDocumentIdOrderByDispatchedAtDesc(UUID documentId);
}
