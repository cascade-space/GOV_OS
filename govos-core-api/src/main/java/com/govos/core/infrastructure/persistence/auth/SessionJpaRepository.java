package com.govos.core.infrastructure.persistence.auth;

import com.govos.core.domain.auth.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionJpaRepository extends JpaRepository<Session, UUID> {
    
    Optional<Session> findByRefreshTokenAndRevokedFalse(String refreshToken);
    
    long countByUserIdAndRevokedFalse(UUID userId);
    
    @Modifying
    @Query(value = """
        UPDATE sessions SET is_revoked = true, revoked_at = NOW() 
        WHERE id = (
            SELECT id FROM sessions 
            WHERE user_id = :userId AND is_revoked = false 
            ORDER BY last_used_at ASC LIMIT 1
        )
    """, nativeQuery = true)
    void revokeOldestSession(@Param("userId") UUID userId);
}
