package com.govos.core.infrastructure.persistence.complaint;

import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.complaint.ComplaintStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class JpaComplaintRepositoryImpl implements ComplaintRepository {

    private final SpringDataComplaintRepository springDataRepo;

    @Override
    public Complaint save(Complaint complaint) {
        JpaComplaint jpaEntity = toJpaEntity(complaint);
        JpaComplaint saved = springDataRepo.save(jpaEntity);
        return toDomainEntity(saved);
    }

    @Override
    public Optional<Complaint> findById(UUID id) {
        return springDataRepo.findById(id).map(this::toDomainEntity);
    }

    @Override
    public List<Complaint> findByTenantId(UUID tenantId) {
        return springDataRepo.findByTenantId(tenantId).stream()
                .map(this::toDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Complaint> findByComplaintNumber(String complaintNumber) {
        return springDataRepo.findByComplaintNumber(complaintNumber).map(this::toDomainEntity);
    }

    @Override
    public List<Complaint> findByReporterMobile(String reporterMobile) {
        return springDataRepo.findByReporterMobileOrderByCreatedAtDesc(reporterMobile).stream()
                .map(this::toDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public String generateNextComplaintNumber(UUID tenantId) {
        long seq = springDataRepo.getNextSequenceForTenant(tenantId);
        String yyyyMM = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        // Assuming tenant code is fetched from context, for now use generic prefix
        return String.format("CMP-GV-%s-%04d", yyyyMM, seq);
    }

    @Override
    public long countByTenantId(UUID tenantId) {
        return springDataRepo.countByTenantId(tenantId);
    }

    @Override
    public long countResolvedByTenantId(UUID tenantId) {
        return springDataRepo.countResolvedByTenantId(tenantId);
    }

    @Override
    public long countByTenantIdAndStatus(UUID tenantId, ComplaintStatus status) {
        return springDataRepo.countByTenantIdAndStatus(tenantId, status.name());
    }

    @Override
    public long countByAssignedToId(UUID assignedToId) {
        return springDataRepo.countByAssignedToId(assignedToId);
    }

    @Override
    public long countByAssignedToIdAndStatus(UUID assignedToId, ComplaintStatus status) {
        return springDataRepo.countByAssignedToIdAndStatus(assignedToId, status);
    }

    @Override
    public List<Object[]> getMonthlyTrend(UUID tenantId) {
        return springDataRepo.getMonthlyTrend(tenantId);
    }

    // Mappers
    private JpaComplaint toJpaEntity(Complaint domain) {
        if (domain == null) return null;
        JpaComplaint jpa = new JpaComplaint();
        jpa.setId(domain.getId());
        jpa.setComplaintNumber(domain.getComplaintNumber());
        jpa.setTenantId(domain.getTenantId());
        jpa.setReporterId(domain.getReporterId());
        jpa.setTitle(domain.getTitle());
        jpa.setDescription(domain.getDescription());
        jpa.setCategory(domain.getCategory());
        jpa.setPriority(domain.getPriority());
        jpa.setStatus(domain.getStatus());
        jpa.setLatitude(domain.getLatitude());
        jpa.setLongitude(domain.getLongitude());
        jpa.setWardId(domain.getWardId());
        jpa.setAssignedToId(domain.getAssignedToId());
        jpa.setAiAssessedAt(domain.getAiAssessedAt());
        jpa.setReporterName(domain.getReporterName());
        jpa.setReporterMobile(domain.getReporterMobile());
        jpa.setSource(domain.getSource() != null ? domain.getSource() : "INTERNAL");
        jpa.setSubCategory(domain.getSubCategory());
        jpa.setLocationAddress(domain.getLocationAddress());
        jpa.setCreatedAt(domain.getCreatedAt());
        jpa.setUpdatedAt(domain.getUpdatedAt());
        jpa.setDeleted(domain.isDeleted());
        return jpa;
    }

    private Complaint toDomainEntity(JpaComplaint jpa) {
        if (jpa == null) return null;
        Complaint domain = new Complaint();
        domain.setId(jpa.getId());
        domain.setComplaintNumber(jpa.getComplaintNumber());
        domain.setTenantId(jpa.getTenantId());
        domain.setReporterId(jpa.getReporterId());
        domain.setTitle(jpa.getTitle());
        domain.setDescription(jpa.getDescription());
        domain.setCategory(jpa.getCategory());
        domain.setPriority(jpa.getPriority());
        domain.setStatus(jpa.getStatus());
        domain.setLatitude(jpa.getLatitude());
        domain.setLongitude(jpa.getLongitude());
        domain.setWardId(jpa.getWardId());
        domain.setAssignedToId(jpa.getAssignedToId());
        domain.setAiAssessedAt(jpa.getAiAssessedAt());
        domain.setReporterName(jpa.getReporterName());
        domain.setReporterMobile(jpa.getReporterMobile());
        domain.setSource(jpa.getSource());
        domain.setSubCategory(jpa.getSubCategory());
        domain.setLocationAddress(jpa.getLocationAddress());
        domain.setCreatedAt(jpa.getCreatedAt());
        domain.setUpdatedAt(jpa.getUpdatedAt());
        domain.setDeleted(jpa.isDeleted());
        return domain;
    }
}
