package com.govos.core.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Strongly-typed configuration properties for GovOS.
 * Replaces @Value annotations with type-safe records.
 */
@ConfigurationProperties(prefix = "govos")
public record GovOsProperties(
    JwtProperties jwt,
    OtpProperties otp,
    MinioProperties minio,
    OpenSearchProperties opensearch,
    InternalProperties internal,
    AiProperties ai,
    SessionProperties session,
    CorsProperties cors
) {

    public record JwtProperties(
        String secret,
        long accessTokenExpiryMs,
        long refreshTokenExpiryMs
    ) {}

    public record OtpProperties(
        int expiryMinutes,
        int maxAttempts,
        int length,
        boolean mockEnabled
    ) {}

    public record MinioProperties(
        String endpoint,
        String accessKey,
        String secretKey,
        String bucketName,
        int urlExpiryMinutes,
        int uploadExpiryMinutes
    ) {}

    public record OpenSearchProperties(
        String uris,
        String username,
        String password,
        String auditIndexPrefix,
        String documentIndex
    ) {}

    public record InternalProperties(
        String serviceKey
    ) {}

    public record AiProperties(
        String serviceUrl,
        int timeoutSeconds
    ) {}

    public record SessionProperties(
        int maxPerUser
    ) {}

    public record CorsProperties(
        java.util.List<String> allowedOrigins,
        String allowedHeaders,
        boolean allowCredentials
    ) {}
}
