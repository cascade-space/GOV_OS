package com.govos.core.application.document;

import com.govos.core.domain.document.DocumentRepository;
import com.govos.core.domain.document.GovDocument;
import com.govos.core.application.complaint.EventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final EventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<GovDocument> listDocuments(UUID tenantId) {
        return documentRepository.findAllByTenantId(tenantId);
    }

    public GovDocument createDocument(UUID tenantId, GovDocument dto) {
        GovDocument document = GovDocument.builder()
                .tenantId(tenantId)
                .documentNumber(dto.getDocumentNumber())
                .title(dto.getTitle())
                .type(dto.getType())
                .status(dto.getStatus())
                .currentDesk(dto.getCurrentDesk())
                .receivedDate(dto.getReceivedDate())
                .build();
        return documentRepository.save(document);
    }
    public GovDocument updateDocument(UUID tenantId, UUID documentId, GovDocument dto) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        document.setDocumentNumber(dto.getDocumentNumber());
        document.setTitle(dto.getTitle());
        document.setType(dto.getType());
        document.setStatus(dto.getStatus());
        document.setCurrentDesk(dto.getCurrentDesk());
        document.setReceivedDate(dto.getReceivedDate());
        return documentRepository.save(document);
    }

    public void deleteDocument(UUID tenantId, UUID documentId) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        document.setDeleted(true);
        documentRepository.save(document);
    }

    public GovDocument routeDocument(UUID tenantId, UUID documentId, String currentDesk, String targetDesk) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        if (document.getCurrentDesk() != null && !document.getCurrentDesk().equals(currentDesk)) {
            throw new IllegalStateException("Only the current desk holder can route this document.");
        }
        
        document.routeTo(targetDesk);
        document = documentRepository.save(document);
        eventPublisher.publishDocumentRouted(document);
        return document;
    }

    public GovDocument receiveDocument(UUID tenantId, UUID documentId, String currentDesk) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        if (document.getCurrentDesk() != null && !document.getCurrentDesk().equals(currentDesk)) {
            throw new IllegalStateException("Only the designated desk can receive this document.");
        }
        
        document.receiveAtDesk();
        return documentRepository.save(document);
    }
}
