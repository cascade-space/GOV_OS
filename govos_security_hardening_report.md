# GovOS — Security Hardening Report
**Milestone:** M0.5 — Codebase Hardening & Cleanup
**Date:** August 29, 2026

---

## 1. Executive Summary

During Milestone M0.5, a security audit was performed across all microservices (`govos-web`, Express backend, Spring Boot core API, NestJS realtime, Python AI). Critical vulnerabilities around fallback JWT secrets, mock OTP exposures, and unauthenticated header bypasses were addressed and hardened.

---

## 2. Vulnerability Audit & Fix Log

| Vulnerability ID | Vulnerability Description | Affected File / Service | Severity | Status in M0.5 | Resolution Implemented |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Hardcoded legacy JWT fallback secret (`civicpath_citizen...`) | `auth.controller.js`, `complaint.controller.js` | **CRITICAL** | **FIXED** | Replaced with standard `process.env.JWT_SECRET` check; throws explicit error if missing in production. |
| **SEC-002** | Unauthenticated `x-user-email` header allowed admin/MLA bypass | `adminAuth.middleware.js`, `officerAuth.middleware.js` | **CRITICAL** | **FIXED** | Enforced Bearer JWT token verification first; restricted header fallback exclusively to non-production environments with warning logs. |
| **SEC-003** | Mock OTP (`123456`) revealed in API response messages | `auth.controller.js` | **HIGH** | **FIXED** | Gated mock OTP text in API response to `NODE_ENV !== 'production'` only. |
| **SEC-004** | Exposed Cloudinary API secret in deployment docs | `RENDER-ENV-VARIABLES.txt`, deployment guides | **MEDIUM** | **DOCUMENTED** | Removed live sample credentials from active code; environment variables used exclusively. |
| **SEC-005** | Lack of Row-Level Security in active Express DB queries | `public-landing-page/backend` DB queries | **CRITICAL** | **STAGED FOR M2** | Migration script `01_add_tenants_and_rls.sql` created and ready for database execution in M2. |

---

## 3. Detailed Fix Highlights

### A. Hardened JWT Secret Resolver (`auth.controller.js`)
```javascript
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET || 'govos_dev_secret_jwt_key_32_characters_minimum';
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev'))) {
        throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing or insecure in production!');
    }
    return secret;
};
```

### B. Bearer Token Verification in Admin Middleware (`adminAuth.middleware.js`)
```javascript
let userEmail = req.user?.email || req.session?.email;

// Verify Bearer token first before evaluating header
const authHeader = req.headers['authorization'];
if (!userEmail && authHeader && authHeader.startsWith('Bearer ')) {
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userEmail = decoded.email || decoded.userEmail;
    } catch (jwtErr) {
        logger.warn('Invalid JWT token in admin authorization attempt');
    }
}

// Development-only fallback with security warning
if (!userEmail && req.headers['x-user-email']) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ success: false, error: 'Authentication token required' });
    }
    userEmail = req.headers['x-user-email'];
    logger.warn(`DEV MODE WARNING: Using unauthenticated x-user-email header for ${userEmail}`);
}
```

---

## 4. Remaining Security Risks & Recommendations

1. **Production SMS Gateway Integration:** Mock OTP is still used for local dev verification (`123456`). Integration with MSG91 / Twilio will replace mock verification in production.
2. **Argon2id Password Hashing:** Spring Boot `govos-core-api` enforces Argon2id password hashing. Users created in legacy Express database (`users.password_hash`) must be migrated to Argon2id hashes upon porting.
3. **Database RLS Enforce:** Enforce database-level tenant isolation via Flyway in Milestone M2.
