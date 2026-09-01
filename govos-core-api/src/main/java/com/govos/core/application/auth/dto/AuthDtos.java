package com.govos.core.application.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Auth request/response DTOs — defined as Java Records for immutability.
 */
public final class AuthDtos {

    private AuthDtos() {}

    // =========================================================
    // OTP FLOW
    // =========================================================

    public record OtpRequestDto(
        @NotBlank(message = "Phone or email is required")
        @Size(max = 255, message = "Identifier too long")
        String identifier     // E.164 phone (e.g. +919876543210) OR email
    ) {}

    public record OtpVerifyDto(
        @NotBlank(message = "Identifier is required")
        String identifier,

        @NotBlank(message = "OTP is required")
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
        String otp,

        String deviceInfo     // Optional: {ua, ip, device_type} JSON
    ) {}

    // =========================================================
    // PASSWORD FLOW
    // =========================================================

    public record LoginDto(
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        String deviceInfo,

        String totpCode       // Optional: 6-digit TOTP code if MFA enabled
    ) {}

    // =========================================================
    // TOKEN REFRESH
    // =========================================================

    public record RefreshTokenDto(
        @NotBlank(message = "Refresh token is required")
        String refreshToken
    ) {}

    // =========================================================
    // RESPONSES
    // =========================================================

    public record AuthResponse(
        String accessToken,
        String refreshToken,
        long accessTokenExpiresIn,    // seconds
        UserProfileDto user,
        TenantDto tenant
    ) {}

    public record UserProfileDto(
        String id,
        String fullName,
        String displayName,
        String email,
        String phone,
        String avatarUrl,
        String primaryRole,
        String wardId,
        String departmentId,
        boolean mfaEnabled
    ) {}

    public record TenantDto(
        String id,
        String name,
        String code,
        String subdomain,
        String logoUrl,
        String primaryColor,
        String timezone,
        String locale,
        boolean mfaRequired
    ) {}

    public record OtpSentResponse(
        boolean sent,
        String maskedDestination,   // "+91XXXXX67890" or "r***h@gmail.com"
        int expiryMinutes
    ) {}

    public record MessageResponse(
        String message
    ) {}
}
