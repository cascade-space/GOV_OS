package com.govos.core.presentation.shared;

import java.time.Instant;

/**
 * Standardized API Error response format.
 */
public record ApiError(
    String code,
    String message,
    Instant timestamp
) {
    public ApiError(String code, String message) {
        this(code, message, Instant.now());
    }
}
