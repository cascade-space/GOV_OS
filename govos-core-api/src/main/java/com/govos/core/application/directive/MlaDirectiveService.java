package com.govos.core.application.directive;

import com.govos.core.application.admin.AuditService;
import com.govos.core.application.complaint.EventPublisher;
import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.complaint.Priority;
import com.govos.core.domain.directive.MlaDirective;
import com.govos.core.domain.directive.MlaDirectiveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class MlaDirectiveService {

    private final MlaDirectiveRepository directiveRepository;
    private final ComplaintRepository complaintRepository;
    private final EventPublisher eventPublisher;
    private final AuditService auditService;

    public MlaDirective issueDirective(UUID tenantId, UUID complaintId, String mlaName,
                                       String constituency, String directiveType,
                                       String instructionNotes, UUID issuedByUserId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        // Create Directive
        MlaDirective directive = new MlaDirective(tenantId, complaintId, mlaName, constituency, directiveType, instructionNotes);
        MlaDirective saved = directiveRepository.save(directive);

        // Escalation on complaint: Upgrade to CRITICAL and set legislative escalation tier (Level 3)
        complaint.setPriority(Priority.CRITICAL);
        complaint.setEscalationLevel(3);
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Broadcast status changed
        eventPublisher.publishComplaintStatusChanged(savedComplaint);

        // Audit Trail
        auditService.record(tenantId, issuedByUserId, "MLA",
                "MLA_DIRECTIVE_ISSUED", "COMPLAINT", complaint.getId().toString(),
                complaint.getComplaintNumber(),
                String.format("{\"mla\":\"%s\",\"constituency\":\"%s\",\"type\":\"%s\"}",
                        mlaName, constituency, directiveType));

        log.info("MLA Directive issued by {} for complaint {} in {}",
                mlaName, complaint.getComplaintNumber(), constituency);

        return saved;
    }

    public List<MlaDirective> listByTenant(UUID tenantId) {
        return directiveRepository.findByTenantId(tenantId);
    }

    public List<MlaDirective> listByComplaint(UUID complaintId) {
        return directiveRepository.findByComplaintId(complaintId);
    }

    public List<MlaDirective> listByConstituency(UUID tenantId, String constituency) {
        return directiveRepository.findByConstituency(tenantId, constituency);
    }
}
