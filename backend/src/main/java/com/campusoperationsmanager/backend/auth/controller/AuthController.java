package com.campusoperationsmanager.backend.auth.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusoperationsmanager.backend.auth.dto.LoginRequest;
import com.campusoperationsmanager.backend.auth.dto.LoginResponse;
import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.TwoFactorService;
import com.campusoperationsmanager.backend.auth.service.UserService;
import com.campusoperationsmanager.backend.security.JwtTokenProvider;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final TwoFactorService twoFactorService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.getUsername(), request.getPassword());

            if (user.isTwoFactorEnabled()) {
                String tempToken = jwtTokenProvider.generatePendingTwoFactorToken(user.getId());
                Map<String, Object> body = new HashMap<>();
                body.put("requiresTwoFactor", true);
                body.put("twoFactorMethod",   user.getTwoFactorMethod());
                body.put("tempToken",          tempToken);
                if ("SMS".equals(user.getTwoFactorMethod())) {
                    String devCode = twoFactorService.storeSmsOtp(user.getId());
                    body.put("devCode", devCode); // ⚠️ dev only
                }
                return ResponseEntity.ok(body);
            }

            String token = jwtTokenProvider.generateToken(
                    user.getId(), user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(token).id(user.getId()).name(user.getName())
                    .email(user.getEmail()).role(user.getRole().name())
                    .profilePicture(user.getProfilePicture()).build());

        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body(ex.getMessage());
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactor(@RequestBody TwoFactorLoginRequest request) {
        try {
            Long userId = jwtTokenProvider.extractUserIdFromPendingToken(request.getTempToken());
            if (userId == null)
                return ResponseEntity.status(401).body("Invalid or expired session. Please log in again.");

            User user = userService.getUserById(userId);
            boolean valid = false;

            if ("TOTP".equals(user.getTwoFactorMethod()))
                valid = twoFactorService.verifyTotpCode(user.getTotpSecret(), request.getCode());
            else if ("SMS".equals(user.getTwoFactorMethod()))
                valid = twoFactorService.verifySmsOtp(userId, request.getCode());

            if (!valid)
                return ResponseEntity.status(401).body("Invalid verification code. Please try again.");

            String token = jwtTokenProvider.generateToken(
                    user.getId(), user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(token).id(user.getId()).name(user.getName())
                    .email(user.getEmail()).role(user.getRole().name())
                    .profilePicture(user.getProfilePicture()).build());

        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Verification failed: " + ex.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(userService.toDTO(user));
    }

    // ─── Forgot / Reset password ──────────────────────────────────────────────

    /**
     * POST /api/auth/forgot-password  (public)
     * Body: { "identifier": "s12345" }  — accepts username or email.
     * DEV: returns the keyword. Production: send keyword via email, return generic message.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            if (request.getIdentifier() == null || request.getIdentifier().isBlank()) {
                return ResponseEntity.badRequest().body("Username or email is required.");
            }
            String keyword = userService.generatePasswordResetKeyword(
                    request.getIdentifier().trim());
            return ResponseEntity.ok(Map.of(
                "message", "Reset keyword generated. Check your email (dev: keyword shown below).",
                "devKeyword", keyword  // ⚠️ Remove in production
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * POST /api/auth/reset-password  (public)
     * Body: { "keyword": "ABC12345", "newPassword": "..." }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPasswordWithKeyword(
                    request.getKeyword(), request.getNewPassword());
            return ResponseEntity.ok("Password reset successfully. You can now log in.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // ─── DTOs ─────────────────────────────────────────────────────────────────
    @Data static class TwoFactorLoginRequest  { private String tempToken; private String code; }
    @Data static class ForgotPasswordRequest  { private String identifier; }
    @Data static class ResetPasswordRequest   { private String keyword; private String newPassword; }
}