package com.govos.core.infrastructure.persistence.auth;

import com.govos.core.domain.auth.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SpringDataRoleRepository extends JpaRepository<Role, UUID> {
    
    @Query(value = "SELECT * FROM roles WHERE code = :code LIMIT 1", nativeQuery = true)
    Optional<Role> findByCode(@Param("code") String code);
}
