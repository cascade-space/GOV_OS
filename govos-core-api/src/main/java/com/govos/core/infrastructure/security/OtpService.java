package com.govos.core.infrastructure.security;

import com.govos.core.application.auth.AuthService;
import com.govos.core.infrastructure.config.GovOsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

/**
 * Manages OTP generation and validation using Redis.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private final GovOsProperties govOsProperties;
    private final SecureRandom random = new SecureRandom();

    private static final String OTP_PREFIX = "otp:";
    private static final String ATTEMPTS_PREFIX = "otp_attempts:";

    /**
     * Generates a random numeric OTP, stores it in Redis, and handles mock mode logging.
     */
    public String generateAndStore(String identifier, String action) {
        String key = buildKey(identifier, action);
        
        // Generate n-digit OTP
        int length = govOsProperties.otp().length();
        int min = (int) Math.pow(10, length - 1);
        int max = (int) Math.pow(10, length) - 1;
        String otp = String.valueOf(random.nextInt((max - min) + 1) + min);

        // Store in Redis with TTL
        Duration ttl = Duration.ofMinutes(govOsProperties.otp().expiryMinutes());
        redisTemplate.opsForValue().set(key, otp, ttl);
        
        // Reset attempts
        redisTemplate.delete(buildAttemptsKey(identifier, action));

        if (govOsProperties.otp().mockEnabled()) {
            log.info("========================================");
            log.info("MOCK OTP FOR {}: {}", identifier, otp);
            log.info("========================================");
        } else {
            // TODO: In real implementation, publish to Redis "govos:events" channel
            // for the NestJS Realtime service to send via MSG91/Email
        }

        return otp;
    }

    /**
     * Verifies an OTP. Throws exception if invalid or max attempts exceeded.
     */
    public void verify(String identifier, String action, String providedOtp) {
        String key = buildKey(identifier, action);
        String attemptsKey = buildAttemptsKey(identifier, action);

        // Check attempts
        String attemptsStr = redisTemplate.opsForValue().get(attemptsKey);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;
        
        if (attempts >= govOsProperties.otp().maxAttempts()) {
            throw new AuthService.AuthException("Too many failed OTP attempts. Request a new OTP.");
        }

        String storedOtp = redisTemplate.opsForValue().get(key);
        
        if (storedOtp == null) {
            throw new AuthService.AuthException("OTP has expired or was not requested");
        }

        if (!storedOtp.equals(providedOtp)) {
            // Increment attempts
            redisTemplate.opsForValue().increment(attemptsKey);
            Duration ttl = redisTemplate.getExpire(key, java.util.concurrent.TimeUnit.SECONDS) != null ?
                Duration.ofSeconds(redisTemplate.getExpire(key, java.util.concurrent.TimeUnit.SECONDS)) :
                Duration.ofMinutes(govOsProperties.otp().expiryMinutes());
            redisTemplate.expire(attemptsKey, ttl);
            
            throw new AuthService.AuthException("Invalid OTP");
        }

        // Success — clean up
        redisTemplate.delete(key);
        redisTemplate.delete(attemptsKey);
    }

    private String buildKey(String identifier, String action) {
        return OTP_PREFIX + action + ":" + identifier;
    }

    private String buildAttemptsKey(String identifier, String action) {
        return ATTEMPTS_PREFIX + action + ":" + identifier;
    }
}
