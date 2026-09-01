package com.govos.core.infrastructure.persistence.auth;

import com.govos.core.domain.auth.User;
import com.govos.core.domain.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA implementation of the Domain's UserRepository port.
 * (Hexagonal Architecture — Adapter)
 */
@Component
@RequiredArgsConstructor
public class JpaUserRepositoryImpl implements UserRepository {

    private final SpringDataUserRepository springDataUserRepository;

    @Override
    public List<User> findByTenantId(UUID tenantId) {
        return springDataUserRepository.findByTenantId(tenantId);
    }

    @Override
    public Optional<User> findByPhone(String phone) {
        return springDataUserRepository.findByPhone(phone);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return springDataUserRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findByIdAndTenantId(UUID id, UUID tenantId) {
        return springDataUserRepository.findByIdAndTenantId(id, tenantId);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return springDataUserRepository.findById(id);
    }

    @Override
    public User save(User user) {
        return springDataUserRepository.save(user);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return springDataUserRepository.existsByPhone(phone);
    }

    @Override
    public boolean existsByEmail(String email) {
        return springDataUserRepository.existsByEmail(email);
    }

    @Override
    public List<User> findAllByTenantIdAndRoleCode(UUID tenantId, String roleCode) {
        return springDataUserRepository.findAllByTenantIdAndRolesCode(tenantId, roleCode);
    }

    @Override
    public long countByTenantIdAndRoleCode(UUID tenantId, String roleCode) {
        return springDataUserRepository.countByTenantIdAndRolesCode(tenantId, roleCode);
    }
}
