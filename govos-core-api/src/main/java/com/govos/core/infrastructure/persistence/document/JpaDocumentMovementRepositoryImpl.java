package com.govos.core.infrastructure.persistence.document;

import com.govos.core.domain.document.DocumentMovement;
import com.govos.core.domain.document.DocumentMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaDocumentMovementRepositoryImpl implements DocumentMovementRepository {

    private final SpringDataDocumentMovementRepository springDataRepo;

    @Override
    public List<DocumentMovement> findAllByDocumentIdOrderByDispatchedAtDesc(UUID documentId) {
        return springDataRepo.findAllByDocumentIdOrderByDispatchedAtDesc(documentId);
    }

    @Override
    public List<DocumentMovement> findAllByTenantId(UUID tenantId) {
        return springDataRepo.findAllByTenantId(tenantId);
    }

    @Override
    public Optional<DocumentMovement> findTopByDocumentIdOrderByDispatchedAtDesc(UUID documentId) {
        return springDataRepo.findTopByDocumentIdOrderByDispatchedAtDesc(documentId);
    }

    @Override
    public DocumentMovement save(DocumentMovement movement) {
        return springDataRepo.save(movement);
    }
}
