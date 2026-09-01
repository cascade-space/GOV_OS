package com.govos.core.domain.auth;

import com.govos.core.domain.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * User Aggregate Root — domain model.
 * <p>
 * Rules:
 * - Password is ALWAYS Argon2id hashed before setting (enforced in AuthService)
 * - OTP flows are stateless from User's perspective (OTP stored in Redis, not here)
 * - Role assignment is tracked in user_roles join table
 * - Ward assignment determines geographic scope for OFFICER role
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_phone", columnList = "phone"),
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_tenant", columnList = "tenant_id")
})
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(name = "phone", length = 15, unique = true)
    private String phone;

    @Column(name = "email", length = 255, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;                // Argon2id — NEVER store raw password

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Builder.Default
    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified = false;

    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "aadhaar_hash", length = 64)
    private String aadhaarHash;                 // SHA-256 of Aadhaar (raw never stored)

    @Column(name = "ward_id")
    private UUID wardId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "employee_code", length = 50)
    private String employeeCode;

    @Column(name = "designation", length = 200)
    private String designation;

    @Column(name = "totp_secret", length = 100)
    private String totpSecret;                  // Encrypted at rest

    @Builder.Default
    @Column(name = "totp_enabled", nullable = false)
    private boolean totpEnabled = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Builder.Default
    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    // =========================================================
    // Domain behaviour (business rules in the domain object)
    // =========================================================

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(Instant.now());
    }

    public void recordSuccessfulLogin() {
        this.lastLoginAt = Instant.now();
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    public void recordFailedLogin() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            // Lock for 15 minutes after 5 failed attempts
            this.lockedUntil = Instant.now().plusSeconds(900);
        }
    }

    public void markPhoneVerified() {
        this.phoneVerified = true;
    }

    public boolean hasRole(String roleCode) {
        return roles.stream().anyMatch(r -> r.getCode().equals(roleCode));
    }

    public String getPrimaryRoleCode() {
        // Priority order: SUPER_ADMIN > TENANT_ADMIN > DEPT_HEAD > OFFICER > REP > CITIZEN
        String[] priority = {"SUPER_ADMIN", "TENANT_ADMIN", "DEPT_HEAD", "OFFICER", "REP", "CITIZEN"};
        for (String code : priority) {
            if (hasRole(code)) return code;
        }
        return "CITIZEN";
    }
}
