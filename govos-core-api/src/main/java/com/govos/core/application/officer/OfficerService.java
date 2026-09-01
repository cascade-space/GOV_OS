package com.govos.core.application.officer;

import com.govos.core.domain.auth.Role;
import com.govos.core.domain.auth.RoleRepository;
import com.govos.core.domain.auth.User;
import com.govos.core.domain.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OfficerService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<User> listOfficers(UUID tenantId) {
        return userRepository.findAllByTenantIdAndRoleCode(tenantId, "OFFICER");
    }

    public User createOfficer(UUID tenantId, User dto) {
        Role officerRole = roleRepository.findByCode("OFFICER")
                .orElseThrow(() -> new RuntimeException("OFFICER role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(officerRole);

        User officer = User.builder()
                .tenantId(tenantId)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .employeeCode(dto.getEmployeeCode())
                .designation(dto.getDesignation())
                .departmentId(dto.getDepartmentId())
                .wardId(dto.getWardId())
                .roles(roles)
                .active(true)
                .build();

        return userRepository.save(officer);
    }
    public User updateOfficer(UUID tenantId, UUID officerId, User dto) {
        User officer = userRepository.findByIdAndTenantId(officerId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Officer not found"));
        officer.setFullName(dto.getFullName());
        officer.setPhone(dto.getPhone());
        officer.setEmail(dto.getEmail());
        officer.setEmployeeCode(dto.getEmployeeCode());
        officer.setDesignation(dto.getDesignation());
        officer.setDepartmentId(dto.getDepartmentId());
        officer.setWardId(dto.getWardId());
        return userRepository.save(officer);
    }

    public void deleteOfficer(UUID tenantId, UUID officerId) {
        User officer = userRepository.findByIdAndTenantId(officerId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Officer not found"));
        officer.setDeleted(true);
        userRepository.save(officer);
    }
}
