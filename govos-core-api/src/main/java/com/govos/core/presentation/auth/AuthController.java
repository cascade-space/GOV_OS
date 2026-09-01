package com.govos.core.presentation.auth;

import com.govos.core.application.auth.AuthService;
import com.govos.core.application.auth.dto.AuthDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/otp/request")
    public ResponseEntity<OtpSentResponse> requestOtp(@Valid @RequestBody OtpRequestDto dto) {
        return ResponseEntity.ok(authService.requestOtp(dto));
    }

    @PostMapping("/public/otp/request")
    public ResponseEntity<OtpSentResponse> requestPublicOtp(@Valid @RequestBody OtpRequestDto dto) {
        return ResponseEntity.ok(authService.requestPublicOtp(dto));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyDto dto) {
        return ResponseEntity.ok(authService.verifyOtp(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenDto dto) {
        return ResponseEntity.ok(authService.refreshToken(dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody RefreshTokenDto dto) {
        return ResponseEntity.ok(authService.logout(dto.refreshToken()));
    }
}
