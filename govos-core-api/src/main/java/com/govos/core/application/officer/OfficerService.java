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
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.security.SecureRandom;
import java.util.Base64;
import com.govos.core.application.outbox.OutboxService;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
@Transactional
public class OfficerService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OutboxService outboxService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<User> listOfficers(UUID tenantId) {
        return userRepository.findAllByTenantIdAndRoleCode(tenantId, "OFFICER");
    }

    public User createOfficer(UUID tenantId, User dto) {
        Role officerRole = roleRepository.findByCode("OFFICER")
                .orElseThrow(() -> new RuntimeException("OFFICER role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(officerRole);
        
        String tempPassword = generateRandomPassword();

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
                .passwordHash(passwordEncoder.encode(tempPassword))
                .active(true)
                .build();

        User saved = userRepository.save(officer);
        
        sendWelcomeEmail(saved, tempPassword);
        return saved;
    }
    
    public void resendCredentials(UUID tenantId, UUID officerId) {
        User officer = userRepository.findByIdAndTenantId(officerId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Officer not found"));
        // Resend welcome email (without password since we don't know it, or maybe just tell them to reset)
        // But the requirement says "resend credentials". We can regenerate and send.
        regeneratePassword(tenantId, officerId);
    }
    
    public void regeneratePassword(UUID tenantId, UUID officerId) {
        User officer = userRepository.findByIdAndTenantId(officerId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Officer not found"));
        
        String newPassword = generateRandomPassword();
        officer.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(officer);
        
        sendWelcomeEmail(officer, newPassword);
    }
    
    private void sendWelcomeEmail(User officer, String password) {
        if (officer.getEmail() != null && !officer.getEmail().isEmpty()) {
            Map<String, String> payload = Map.of(
                "to", officer.getEmail(),
                "subject", "Welcome to GovOS - Officer Account Created",
                "body", "Hello " + officer.getFullName() + ",\n\nYour account has been created.\nLogin Email: " + officer.getEmail() + "\nTemporary Password: " + password + "\n\nPlease change your password after logging in."
            );
            outboxService.recordEvent(officer.getTenantId(), "email:sent", "EMAIL", officer.getId(), payload);
        }
    }
    
    private String generateRandomPassword() {
        byte[] randomBytes = new byte[12];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes) + "!";
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
