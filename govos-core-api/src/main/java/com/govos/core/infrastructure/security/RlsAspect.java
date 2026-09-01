package com.govos.core.infrastructure.security;

import com.govos.core.presentation.auth.JwtAuthFilter;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Aspect to enforce Row-Level Security (RLS) at the database level.
 * Executes SET LOCAL app.tenant_id at the start of every transaction.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RlsAspect {

    private final EntityManager entityManager;

    @Before("@annotation(transactional)")
    public void setTenantContext(Transactional transactional) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthFilter.GovOsUserDetails details) {
            UUID tenantId = details.tenantId();
            if (tenantId != null) {
                // Ignore for SUPER_ADMIN when they need cross-tenant access, 
                // but for MTAS strict mode we set it and handle cross-tenant carefully.
                // For now, if role is SUPER_ADMIN, we can either set a special UUID or bypass.
                // Let's set it so the SQLRestriction can use it.
                entityManager.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId.toString() + "'").executeUpdate();
            }
        }
    }
}
