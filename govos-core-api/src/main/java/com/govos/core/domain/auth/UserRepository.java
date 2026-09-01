package com.govos.core.domain.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * UserRepository — Domain Port (Hexagonal Architecture)
 * <p>
 * This interface lives in the DOMAIN layer.
 * The JPA implementation lives in the INFRASTRUCTURE layer.
 * <p>
 * Rule: This interface MUST NOT import any Spring or JPA annotations.
 * It defines the contract; adapters implement it.
 */
public interface UserRepository {
    List<User> findByTenantId(UUID tenantId);
    
    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<User> findById(UUID id);

    User save(User user);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    List<User> findAllByTenantIdAndRoleCode(UUID tenantId, String roleCode);

    long countByTenantIdAndRoleCode(UUID tenantId, String roleCode);
}
