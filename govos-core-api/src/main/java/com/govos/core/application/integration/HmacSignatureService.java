package com.govos.core.application.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;

@Service
@Slf4j
public class HmacSignatureService {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final long DEFAULT_MAX_DRIFT_SECONDS = 300L; // 5 minutes

    /**
     * Computes HMAC-SHA256 hex string for given payload and secret key.
     */
    public String computeSignature(String payload, String secret) {
        if (payload == null) payload = "";
        if (secret == null) secret = "";
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (Exception e) {
            log.error("Failed to compute HMAC-SHA256 signature", e);
            throw new RuntimeException("Error computing cryptographic signature", e);
        }
    }

    /**
     * Validates incoming HMAC signature in constant time to prevent timing attacks.
     */
    public boolean verifySignature(String payload, String secret, String providedSignature) {
        if (providedSignature == null || providedSignature.isBlank()) {
            return false;
        }
        String calculated = computeSignature(payload, secret);
        return MessageDigest.isEqual(
                calculated.getBytes(StandardCharsets.UTF_8),
                providedSignature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Validates that the request timestamp is within tolerance to prevent replay attacks.
     */
    public boolean isTimestampValid(String timestampHeader, long maxDriftSeconds) {
        if (timestampHeader == null || timestampHeader.isBlank()) {
            return false;
        }
        try {
            long requestEpochSeconds = Long.parseLong(timestampHeader.trim());
            long currentEpochSeconds = Instant.now().getEpochSecond();
            long drift = Math.abs(currentEpochSeconds - requestEpochSeconds);
            return drift <= (maxDriftSeconds > 0 ? maxDriftSeconds : DEFAULT_MAX_DRIFT_SECONDS);
        } catch (NumberFormatException e) {
            log.warn("Invalid timestamp header format: {}", timestampHeader);
            return false;
        }
    }
}
