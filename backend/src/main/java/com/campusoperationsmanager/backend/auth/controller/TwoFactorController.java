package com.campusoperationsmanager.backend.auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.TwoFactorService;
import com.campusoperationsmanager.backend.auth.service.UserService;

import dev.samstevens.totp.exceptions.QrGenerationException;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/2fa")
@RequiredArgsConstructor
public class TwoFactorController {

    private final TwoFactorService twoFactorService;
    private final UserService userService;

    /** GET /api/2fa/status */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(Map.of(
            "enabled", user.isTwoFactorEnabled(),
            "method",  user.getTwoFactorMethod() != null ? user.getTwoFactorMethod() : ""
        ));
    }

    // ─── Password verification before sensitive 2FA actions ──────────────────

    /**
     * POST /api/2fa/confirm-password
     * Used before switching or disabling 2FA. Returns 200 if password is valid.
     */
    @PostMapping("/confirm-password")
    public ResponseEntity<?> confirmPassword(
            @AuthenticationPrincipal Long userId,
            @RequestBody PasswordRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Password is required.");
        }
        boolean valid = twoFactorService.verifyPassword(userId, request.getPassword());
        if (!valid) {
            return ResponseEntity.status(401).body("Incorrect password. Please try again.");
        }
        return ResponseEntity.ok(Map.of("verified", true));
    }

    // ─── TOTP setup ───────────────────────────────────────────────────────────

    /** POST /api/2fa/setup/totp — returns secret + QR code */
    @PostMapping("/setup/totp")
    public ResponseEntity<?> setupTotp(@AuthenticationPrincipal Long userId) {
        User user = userService.getUserById(userId);
        try {
            String secret = twoFactorService.generateTotpSecret();
            String qrCode = twoFactorService.generateQrCodeBase64(secret, user.getEmail());
            return ResponseEntity.ok(Map.of("secret", secret, "qrCode", qrCode));
        } catch (QrGenerationException e) {
            return ResponseEntity.status(500).body("Failed to generate QR code.");
        }
    }

    /** POST /api/2fa/verify/totp — confirm TOTP code and enable */
    @PostMapping("/verify/totp")
    public ResponseEntity<?> verifyTotp(
            @AuthenticationPrincipal Long userId,
            @RequestBody TotpVerifyRequest request) {
        if (!twoFactorService.verifyTotpCode(request.getSecret(), request.getCode())) {
            return ResponseEntity.badRequest().body("Invalid code. Please try again.");
        }
        twoFactorService.enableTotpTwoFactor(userId, request.getSecret());
        return ResponseEntity.ok(Map.of("message", "Authenticator app 2FA enabled successfully."));
    }

    // ─── SMS setup — 2-step: send OTP → verify ────────────────────────────────

    /**
     * POST /api/2fa/setup/sms/send-otp
     * Accepts { phone }, sends OTP to that number (dev: returns it).
     */
    @PostMapping("/setup/sms/send-otp")
    public ResponseEntity<?> sendSmsOtp(
            @AuthenticationPrincipal Long userId,
            @RequestBody PhoneRequest request) {
        try {
            String devCode = twoFactorService.sendPhoneVerificationOtp(userId, request.getPhone());
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent to " + request.getPhone() + " (dev mode — shown below)",
                "devCode", devCode  // ⚠️ Remove in production
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * POST /api/2fa/setup/sms/verify-phone
     * Accepts { code }, verifies OTP, sets phone on user, enables SMS 2FA.
     */
    @PostMapping("/setup/sms/verify-phone")
    public ResponseEntity<?> verifyPhoneAndEnableSms(
            @AuthenticationPrincipal Long userId,
            @RequestBody CodeRequest request) {
        try {
            twoFactorService.verifyPhoneAndEnableSms(userId, request.getCode());
            return ResponseEntity.ok(Map.of("message", "SMS two-step verification enabled successfully."));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // ─── Disable ──────────────────────────────────────────────────────────────

    /**
     * DELETE /api/2fa/disable
     * Requires { password } to confirm identity before disabling.
     */
    @DeleteMapping("/disable")
    public ResponseEntity<?> disable(
            @AuthenticationPrincipal Long userId,
            @RequestBody PasswordRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Password is required to disable two-step verification.");
        }
        if (!twoFactorService.verifyPassword(userId, request.getPassword())) {
            return ResponseEntity.status(401).body("Incorrect password. Please try again.");
        }
        twoFactorService.disableTwoFactor(userId);
        return ResponseEntity.ok(Map.of("message", "Two-factor authentication has been disabled."));
    }

    // ─── Inner request DTOs ───────────────────────────────────────────────────
    @Data static class TotpVerifyRequest { private String secret; private String code; }
    @Data static class CodeRequest        { private String code; }
    @Data static class PasswordRequest    { private String password; }
    @Data static class PhoneRequest       { private String phone; }
}