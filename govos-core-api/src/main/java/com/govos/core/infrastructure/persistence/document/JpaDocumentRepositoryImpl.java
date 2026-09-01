package com.govos.core.infrastructure.persistence.document;

import com.govos.core.domain.document.GovDocument;
import com.govos.core.domain.document.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaDocumentRepositoryImpl implements DocumentRepository {

    private final SpringDataDocumentRepository springDataDocumentRepository;

    @Override
    public List<GovDocument> findAllByTenantId(UUID tenantId) {
        return springDataDocumentRepository.findAllByTenantId(tenantId);
    }

    @Override
    public Optional<GovDocument> findByIdAndTenantId(UUID id, UUID tenantId) {
        return springDataDocumentRepository.findByIdAndTenantId(id, tenantId);
    }

    @Override
    public GovDocument save(GovDocument document) {
        return springDataDocumentRepository.save(document);
    }

    @Override
    public void delete(GovDocument document) {
        document.setDeleted(true);
        springDataDocumentRepository.save(document);
    }

    @Override
    public long countByTenantId(UUID tenantId) {
        return springDataDocumentRepository.countByTenantId(tenantId);
    }
}
