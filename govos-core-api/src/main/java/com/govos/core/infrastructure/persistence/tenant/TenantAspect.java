package com.govos.core.infrastructure.persistence.tenant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Aspect to enforce PostgreSQL Row-Level Security (RLS) for Multi-Tenant Architecture.
 * Intercepts every @Transactional method and sets the `app.tenant_id` session variable.
 */
@Aspect
@Component
@Slf4j
public class TenantAspect {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Executes before any Spring @Transactional method.
     */
    @Before("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    public void setTenantIdForTransaction() {
        String tenantId = null;

        // 1. Try to get it from SecurityContext (if authenticated)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
            if (requestAttributes instanceof ServletRequestAttributes) {
                tenantId = (String) requestAttributes.getAttribute("GOVOS_TENANT_ID", RequestAttributes.SCOPE_REQUEST);
            }
        }

        // 2. Apply to PostgreSQL Transaction
        if (tenantId != null && !tenantId.isEmpty()) {
            log.debug("Setting PostgreSQL RLS tenant_id to {}", tenantId);
            // SET LOCAL applies only to the current transaction
            entityManager.createNativeQuery("SET LOCAL app.tenant_id = '" + tenantId + "'").executeUpdate();
        } else {
            // For unauthenticated requests (like login/otp), clear it just in case
            entityManager.createNativeQuery("SET LOCAL app.tenant_id = ''").executeUpdate();
        }
    }
}
