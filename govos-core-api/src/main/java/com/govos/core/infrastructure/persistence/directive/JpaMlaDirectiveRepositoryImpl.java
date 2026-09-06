package com.govos.core.infrastructure.persistence.directive;

import com.govos.core.domain.directive.MlaDirective;
import com.govos.core.domain.directive.MlaDirectiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class JpaMlaDirectiveRepositoryImpl implements MlaDirectiveRepository {

    private final SpringDataMlaDirectiveRepository springDataRepo;

    @Override
    public MlaDirective save(MlaDirective domain) {
        JpaMlaDirective jpa = toJpa(domain);
        JpaMlaDirective saved = springDataRepo.save(jpa);
        return toDomain(saved);
    }

    @Override
    public Optional<MlaDirective> findById(UUID id) {
        return springDataRepo.findById(id).map(this::toDomain);
    }

    @Override
    public List<MlaDirective> findByTenantId(UUID tenantId) {
        return springDataRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<MlaDirective> findByComplaintId(UUID complaintId) {
        return springDataRepo.findByComplaintIdOrderByCreatedAtDesc(complaintId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<MlaDirective> findByConstituency(UUID tenantId, String constituency) {
        return springDataRepo.findByTenantIdAndConstituencyIgnoreCaseOrderByCreatedAtDesc(tenantId, constituency).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private JpaMlaDirective toJpa(MlaDirective domain) {
        if (domain == null) return null;
        JpaMlaDirective jpa = new JpaMlaDirective();
        jpa.setId(domain.getId());
        jpa.setTenantId(domain.getTenantId());
        jpa.setComplaintId(domain.getComplaintId());
        jpa.setMlaName(domain.getMlaName());
        jpa.setConstituency(domain.getConstituency());
        jpa.setDirectiveType(domain.getDirectiveType());
        jpa.setInstructionNotes(domain.getInstructionNotes());
        jpa.setStatus(domain.getStatus());
        jpa.setCreatedAt(domain.getCreatedAt());
        jpa.setUpdatedAt(domain.getUpdatedAt());
        jpa.setDeleted(domain.isDeleted());
        return jpa;
    }

    private MlaDirective toDomain(JpaMlaDirective jpa) {
        if (jpa == null) return null;
        MlaDirective domain = new MlaDirective();
        domain.setId(jpa.getId());
        domain.setTenantId(jpa.getTenantId());
        domain.setComplaintId(jpa.getComplaintId());
        domain.setMlaName(jpa.getMlaName());
        domain.setConstituency(jpa.getConstituency());
        domain.setDirectiveType(jpa.getDirectiveType());
        domain.setInstructionNotes(jpa.getInstructionNotes());
        domain.setStatus(jpa.getStatus());
        domain.setCreatedAt(jpa.getCreatedAt());
        domain.setUpdatedAt(jpa.getUpdatedAt());
        domain.setDeleted(jpa.isDeleted());
        return domain;
    }
}
