package com.govos.core.application.document;

import com.govos.core.application.outbox.OutboxService;
import com.govos.core.domain.document.DocumentMovement;
import com.govos.core.domain.document.DocumentMovementRepository;
import com.govos.core.domain.document.DocumentRepository;
import com.govos.core.domain.document.GovDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMovementRepository documentMovementRepository;
    private final OutboxService outboxService;

    @Transactional(readOnly = true)
    public List<GovDocument> listDocuments(UUID tenantId) {
        return documentRepository.findAllByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public GovDocument getDocument(UUID tenantId, UUID documentId) {
        return documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));
    }

    public GovDocument createDocument(UUID tenantId, GovDocument dto) {
        GovDocument document = GovDocument.builder()
                .tenantId(tenantId)
                .documentNumber(dto.getDocumentNumber() != null ? dto.getDocumentNumber() : "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title(dto.getTitle())
                .type(dto.getType() != null ? dto.getType() : "LETTER")
                .status(dto.getStatus() != null ? dto.getStatus() : "RECEIVED")
                .currentDesk(dto.getCurrentDesk() != null ? dto.getCurrentDesk() : "INWARD_DAK_SECTION")
                .receivedDate(dto.getReceivedDate() != null ? dto.getReceivedDate() : java.time.LocalDate.now())
                .directiveId(dto.getDirectiveId())
                .complaintId(dto.getComplaintId())
                .departmentId(dto.getDepartmentId())
                .priority(dto.getPriority() != null ? dto.getPriority() : "NORMAL")
                .attachmentUrl(dto.getAttachmentUrl())
                .nextHearingDate(dto.getNextHearingDate())
                .hearingBenchOfficer(dto.getHearingBenchOfficer())
                .hearingSummary(dto.getHearingSummary())
                .hearingOrderUrl(dto.getHearingOrderUrl())
                .build();

        GovDocument saved = documentRepository.save(document);

        // Record initial inward movement
        DocumentMovement initialMovement = DocumentMovement.builder()
                .tenantId(tenantId)
                .documentId(saved.getId())
                .fromDesk("CITIZEN_INWARD")
                .toDesk(saved.getCurrentDesk())
                .dispatchedAt(Instant.now())
                .receivedAt(Instant.now())
                .dispatchNotes("Initial document registration & inward dak filing")
                .receiptRemarks("Inward accepted at " + saved.getCurrentDesk())
                .isUrgent("URGENT".equalsIgnoreCase(saved.getPriority()) || "IMMEDIATE".equalsIgnoreCase(saved.getPriority()))
                .build();
        documentMovementRepository.save(initialMovement);

        outboxService.recordEvent(tenantId, "document:created", "DOCUMENT", saved.getId(), saved);
        return saved;
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
        document.setDirectiveId(dto.getDirectiveId());
        document.setComplaintId(dto.getComplaintId());
        document.setDepartmentId(dto.getDepartmentId());
        document.setPriority(dto.getPriority());
        document.setAttachmentUrl(dto.getAttachmentUrl());
        document.setNextHearingDate(dto.getNextHearingDate());
        document.setHearingBenchOfficer(dto.getHearingBenchOfficer());
        document.setHearingSummary(dto.getHearingSummary());
        document.setHearingOrderUrl(dto.getHearingOrderUrl());
        return documentRepository.save(document);
    }

    public void deleteDocument(UUID tenantId, UUID documentId) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        document.setDeleted(true);
        documentRepository.save(document);
    }

    public GovDocument routeDocument(UUID tenantId, UUID documentId, String currentDesk, String targetDesk, String notes, boolean isUrgent, UUID officerId) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        String fromDesk = currentDesk != null && !currentDesk.isBlank() ? currentDesk : document.getCurrentDesk();
        document.routeTo(targetDesk);
        GovDocument saved = documentRepository.save(document);

        DocumentMovement movement = DocumentMovement.builder()
                .tenantId(tenantId)
                .documentId(saved.getId())
                .fromDesk(fromDesk)
                .toDesk(targetDesk)
                .dispatchedAt(Instant.now())
                .dispatchNotes(notes)
                .isUrgent(isUrgent)
                .createdBy(officerId)
                .build();
        documentMovementRepository.save(movement);

        outboxService.recordEvent(tenantId, "document:routed", "DOCUMENT", saved.getId(), saved);
        return saved;
    }

    public GovDocument receiveDocument(UUID tenantId, UUID documentId, String targetDesk, String remarks, UUID officerId) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        document.receiveAtDesk();
        if (targetDesk != null && !targetDesk.isBlank()) {
            document.setCurrentDesk(targetDesk);
        }
        GovDocument saved = documentRepository.save(document);

        documentMovementRepository.findTopByDocumentIdOrderByDispatchedAtDesc(saved.getId())
                .ifPresent(latestMovement -> {
                    latestMovement.setReceivedAt(Instant.now());
                    latestMovement.setReceiptRemarks(remarks);
                    documentMovementRepository.save(latestMovement);
                });

        outboxService.recordEvent(tenantId, "document:received", "DOCUMENT", saved.getId(), saved);
        return saved;
    }

    public GovDocument scheduleHearing(UUID tenantId, UUID documentId, Instant hearingDate, String benchOfficer, String summary) {
        GovDocument document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        document.scheduleHearing(hearingDate, benchOfficer, summary);
        GovDocument saved = documentRepository.save(document);

        outboxService.recordEvent(tenantId, "peshi:hearing_scheduled", "DOCUMENT", saved.getId(), saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<DocumentMovement> listMovements(UUID tenantId, UUID documentId) {
        // Validate document exists in tenant
        documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        return documentMovementRepository.findAllByDocumentIdOrderByDispatchedAtDesc(documentId);
    }
}
