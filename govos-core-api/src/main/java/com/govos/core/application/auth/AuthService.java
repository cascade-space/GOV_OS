package com.govos.core.application.auth;

import com.govos.core.application.auth.dto.AuthDtos.*;
import com.govos.core.domain.auth.Tenant;
import com.govos.core.domain.auth.User;
import com.govos.core.domain.auth.UserRepository;
import com.govos.core.infrastructure.config.GovOsProperties;
import com.govos.core.infrastructure.security.JwtTokenProvider;
import com.govos.core.infrastructure.security.OtpService;
import com.govos.core.infrastructure.persistence.auth.TenantJpaRepository;
import com.govos.core.infrastructure.persistence.auth.SessionJpaRepository;
import com.govos.core.domain.auth.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * AuthService — Application Use Case layer.
 * <p>
 * Coordinates: OTP → User lookup → JWT generation → Session management.
 * This class MUST NOT contain infrastructure concerns (no JPA, no Redis, no JWT internals).
 * All those are delegated to injected infrastructure services.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final TenantJpaRepository tenantRepository;
    private final SessionJpaRepository sessionRepository;
    private final OtpService otpService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final GovOsProperties govOsProperties;

    // =========================================================
    // 1. REQUEST OTP
    // =========================================================

    @Transactional
    public OtpSentResponse requestPublicOtp(OtpRequestDto dto) {
        String identifier = dto.identifier().trim();
        boolean isPhone = identifier.startsWith("+");
        if (!isPhone) {
            throw new AuthException("Public login requires a valid phone number starting with country code");
        }

        // Check if user exists, if not, auto-register as CITIZEN
        User user = userRepository.findByPhone(identifier).orElseGet(() -> {
            Tenant defaultTenant = tenantRepository.findAll().get(0);
            User newUser = User.builder()
                .tenantId(defaultTenant.getId())
                .phone(identifier)
                .fullName("Citizen")
                .active(true)
                .phoneVerified(false)
                .build();
            return userRepository.save(newUser);
        });

        if (!user.isActive()) {
            throw new AuthException("Your account has been deactivated. Contact your administrator.");
        }
        if (user.isLocked()) {
            throw new AuthException("Account temporarily locked due to multiple failed attempts. Try again later.");
        }

        // Generate and store OTP
        String otp = otpService.generateAndStore(identifier, "LOGIN");
        String masked = maskPhone(identifier);
        log.info("Public OTP requested for identifier={} (mock={})", masked, govOsProperties.otp().mockEnabled());

        return new OtpSentResponse(true, masked, govOsProperties.otp().expiryMinutes());
    }

    @Transactional(readOnly = true)
    public OtpSentResponse requestOtp(OtpRequestDto dto) {
        String identifier = dto.identifier().trim();
        boolean isPhone = identifier.startsWith("+");

        // Check if user exists
        User user = isPhone
            ? userRepository.findByPhone(identifier)
                .orElseThrow(() -> new AuthException("No account found for this phone number"))
            : userRepository.findByEmail(identifier)
                .orElseThrow(() -> new AuthException("No account found for this email"));

        if (!user.isActive()) {
            throw new AuthException("Your account has been deactivated. Contact your administrator.");
        }
        if (user.isLocked()) {
            throw new AuthException("Account temporarily locked due to multiple failed attempts. Try again later.");
        }

        // Generate and store OTP
        String otp = otpService.generateAndStore(identifier, "LOGIN");

        // Mask destination for response
        String masked = isPhone
            ? maskPhone(identifier)
            : maskEmail(identifier);

        log.info("OTP requested for identifier={} (mock={})", masked, govOsProperties.otp().mockEnabled());

        return new OtpSentResponse(true, masked, govOsProperties.otp().expiryMinutes());
    }

    // =========================================================
    // 2. VERIFY OTP → issue JWT
    // =========================================================

    public AuthResponse verifyOtp(OtpVerifyDto dto) {
        String identifier = dto.identifier().trim();
        boolean isPhone = identifier.startsWith("+");

        // Validate OTP
        otpService.verify(identifier, "LOGIN", dto.otp());

        // Load user
        User user = isPhone
            ? userRepository.findByPhone(identifier)
                .orElseThrow(() -> new AuthException("User not found"))
            : userRepository.findByEmail(identifier)
                .orElseThrow(() -> new AuthException("User not found"));

        if (!user.isActive()) throw new AuthException("Account deactivated");
        if (user.isLocked()) throw new AuthException("Account locked");

        // Mark phone as verified on first OTP success
        if (isPhone && !user.isPhoneVerified()) {
            user.markPhoneVerified();
        }

        user.recordSuccessfulLogin();
        userRepository.save(user);

        return issueTokensAndBuildResponse(user, dto.deviceInfo());
    }

    // =========================================================
    // 3. EMAIL + PASSWORD LOGIN
    // =========================================================

    public AuthResponse login(LoginDto dto) {
        User user = userRepository.findByEmail(dto.email().trim())
            .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!user.isActive()) throw new AuthException("Account deactivated");
        if (user.isLocked()) throw new AuthException(
            "Account locked due to too many failed attempts. Try again in 15 minutes.");

        if (user.getPasswordHash() == null || !passwordEncoder.matches(dto.password(), user.getPasswordHash())) {
            user.recordFailedLogin();
            userRepository.save(user);
            int remaining = Math.max(0, 5 - user.getFailedLoginAttempts());
            throw new AuthException("Invalid email or password. " + remaining + " attempts remaining.");
        }

        // MFA check
        Tenant tenant = tenantRepository.findById(user.getTenantId())
            .orElseThrow(() -> new AuthException("Tenant not found"));

        if ((tenant.isMfaRequired() || user.isTotpEnabled()) && dto.totpCode() == null) {
            throw new MfaRequiredException("MFA verification required");
        }

        user.recordSuccessfulLogin();
        userRepository.save(user);

        return issueTokensAndBuildResponse(user, dto.deviceInfo());
    }

    // =========================================================
    // 4. REFRESH TOKEN
    // =========================================================

    public AuthResponse refreshToken(RefreshTokenDto dto) {
        String refreshToken = dto.refreshToken();

        Session session = sessionRepository.findByRefreshTokenAndRevokedFalse(
            jwtTokenProvider.hashToken(refreshToken))
            .orElseThrow(() -> new AuthException("Invalid or expired refresh token"));

        if (session.getExpiresAt().isBefore(Instant.now())) {
            session.setRevoked(true);
            sessionRepository.save(session);
            throw new AuthException("Refresh token expired. Please log in again.");
        }

        User user = userRepository.findByIdAndTenantId(session.getUserId(), session.getTenantId())
            .orElseThrow(() -> new AuthException("User not found"));

        if (!user.isActive()) {
            session.setRevoked(true);
            sessionRepository.save(session);
            throw new AuthException("Account deactivated");
        }

        session.setLastUsedAt(Instant.now());
        sessionRepository.save(session);

        Tenant tenant = tenantRepository.findById(user.getTenantId())
            .orElseThrow(() -> new AuthException("Tenant not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user, tenant);

        return new AuthResponse(
            newAccessToken,
            refreshToken,        // Reuse existing refresh token
            govOsProperties.jwt().accessTokenExpiryMs() / 1000,
            buildUserProfile(user),
            buildTenantDto(tenant)
        );
    }

    // =========================================================
    // 5. LOGOUT
    // =========================================================

    public MessageResponse logout(String refreshToken) {
        sessionRepository.findByRefreshTokenAndRevokedFalse(
            jwtTokenProvider.hashToken(refreshToken))
            .ifPresent(session -> {
                session.setRevoked(true);
                session.setRevokedAt(Instant.now());
                sessionRepository.save(session);
            });
        return new MessageResponse("Successfully logged out");
    }

    // =========================================================
    // PRIVATE HELPERS
    // =========================================================

    private AuthResponse issueTokensAndBuildResponse(User user, String deviceInfo) {
        Tenant tenant = tenantRepository.findById(user.getTenantId())
            .orElseThrow(() -> new AuthException("Tenant configuration error"));

        // Enforce session limit
        long activeSessions = sessionRepository.countByUserIdAndRevokedFalse(user.getId());
        if (activeSessions >= tenant.getMaxSessions()) {
            // Revoke the oldest session
            sessionRepository.revokeOldestSession(user.getId());
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user, tenant);
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        Session session = Session.builder()
            .tenantId(user.getTenantId())
            .userId(user.getId())
            .refreshToken(jwtTokenProvider.hashToken(refreshToken))
            .deviceInfo(deviceInfo)
            .expiresAt(Instant.now().plusMillis(govOsProperties.jwt().refreshTokenExpiryMs()))
            .build();
        sessionRepository.save(session);

        return new AuthResponse(
            accessToken,
            refreshToken,
            govOsProperties.jwt().accessTokenExpiryMs() / 1000,
            buildUserProfile(user),
            buildTenantDto(tenant)
        );
    }

    private UserProfileDto buildUserProfile(User user) {
        return new UserProfileDto(
            user.getId().toString(),
            user.getFullName(),
            user.getDisplayName() != null ? user.getDisplayName() : user.getFullName().split(" ")[0],
            user.getEmail(),
            user.getPhone(),
            user.getAvatarUrl(),
            user.getPrimaryRoleCode(),
            user.getWardId() != null ? user.getWardId().toString() : null,
            user.getDepartmentId() != null ? user.getDepartmentId().toString() : null,
            user.isTotpEnabled()
        );
    }

    private TenantDto buildTenantDto(Tenant tenant) {
        return new TenantDto(
            tenant.getId().toString(),
            tenant.getName(),
            tenant.getCode(),
            tenant.getSubdomain(),
            tenant.getLogoUrl(),
            tenant.getPrimaryColor(),
            tenant.getTimezone(),
            tenant.getLocale(),
            tenant.isMfaRequired()
        );
    }

    private String maskPhone(String phone) {
        if (phone.length() < 7) return "***";
        return phone.substring(0, 3) + "XXXXX" + phone.substring(phone.length() - 4);
    }

    private String maskEmail(String email) {
        String[] parts = email.split("@");
        if (parts.length != 2) return "***@***";
        String local = parts[0];
        String domain = parts[1];
        return (local.length() > 2 ? local.charAt(0) + "***" + local.charAt(local.length() - 1) : "***")
            + "@" + domain;
    }

    // Custom exceptions
    public static class AuthException extends RuntimeException {
        public AuthException(String message) { super(message); }
    }

    public static class MfaRequiredException extends RuntimeException {
        public MfaRequiredException(String message) { super(message); }
    }
}
