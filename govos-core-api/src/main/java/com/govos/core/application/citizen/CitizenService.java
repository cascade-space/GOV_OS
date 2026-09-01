package com.govos.core.application.citizen;

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
public class CitizenService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<User> listCitizens(UUID tenantId) {
        return userRepository.findAllByTenantIdAndRoleCode(tenantId, "CITIZEN");
    }

    public User createCitizen(UUID tenantId, User dto) {
        Role citizenRole = roleRepository.findByCode("CITIZEN")
                .orElseThrow(() -> new RuntimeException("CITIZEN role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(citizenRole);

        User citizen = User.builder()
                .tenantId(tenantId)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .wardId(dto.getWardId())
                .active(true)
                .roles(roles)
                .build();

        return userRepository.save(citizen);
    }
    public User updateCitizen(UUID tenantId, UUID citizenId, User dto) {
        User citizen = userRepository.findByIdAndTenantId(citizenId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Citizen not found"));
        citizen.setFullName(dto.getFullName());
        citizen.setPhone(dto.getPhone());
        citizen.setEmail(dto.getEmail());
        if (dto.getWardId() != null) {
            citizen.setWardId(dto.getWardId());
        }
        return userRepository.save(citizen);
    }

    public void deleteCitizen(UUID tenantId, UUID citizenId) {
        User citizen = userRepository.findByIdAndTenantId(citizenId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Citizen not found"));
        citizen.setDeleted(true);
        userRepository.save(citizen);
    }
}
