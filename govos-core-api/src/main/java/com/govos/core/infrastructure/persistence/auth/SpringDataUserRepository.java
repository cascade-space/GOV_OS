package com.govos.core.infrastructure.persistence.auth;

import com.govos.core.domain.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataUserRepository extends JpaRepository<User, UUID> {
    List<User> findByTenantId(UUID tenantId);
    
    Optional<User> findByPhone(String phone);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByIdAndTenantId(UUID id, UUID tenantId);
    
    boolean existsByPhone(String phone);
    
    boolean existsByEmail(String email);

    @Query(value = "SELECT DISTINCT u.* FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.tenant_id = :tenantId AND r.code = :roleCode AND u.is_deleted = false", nativeQuery = true)
    List<User> findAllByTenantIdAndRolesCode(@Param("tenantId") UUID tenantId, @Param("roleCode") String roleCode);

    @Query(value = "SELECT COUNT(DISTINCT u.id) FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.tenant_id = :tenantId AND r.code = :roleCode AND u.is_deleted = false", nativeQuery = true)
    long countByTenantIdAndRolesCode(@Param("tenantId") UUID tenantId, @Param("roleCode") String roleCode);
}
