package com.govos.core.infrastructure.security;

import com.govos.core.domain.auth.Tenant;
import com.govos.core.domain.auth.User;
import com.govos.core.infrastructure.config.GovOsProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

/**
 * JWT Token generation and validation.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private final GovOsProperties govOsProperties;
    private final SecretKey key;

    public JwtTokenProvider(GovOsProperties govOsProperties) {
        this.govOsProperties = govOsProperties;
        this.key = Keys.hmacShaKeyFor(govOsProperties.jwt().secret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a short-lived access token with all claims required for RBAC and MTAS.
     */
    public String generateAccessToken(User user, Tenant tenant) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + govOsProperties.jwt().accessTokenExpiryMs());

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("tid", tenant.getId().toString())
                .claim("rid", user.getPrimaryRoleCode())
                .claim("wid", user.getWardId() != null ? user.getWardId().toString() : null)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Generates a long-lived cryptographically secure random string (Not a JWT).
     */
    public String generateRefreshToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Hashes a string (like a refresh token) so it can be safely stored in the database.
     */
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Validates an access token and returns its claims.
     */
    public Claims validateAndExtractClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            throw new RuntimeException("Invalid or expired JWT token");
        }
    }
}
