package com.campusoperationsmanager.backend.auth.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campusoperationsmanager.backend.auth.dto.InviteCompleteRequest;
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
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body("Email is required.");
            }
            if (request.getUniversityId() == null || request.getUniversityId().isBlank()) {
                return ResponseEntity.badRequest().body("University ID is required.");
            }
            userService.generatePasswordResetKeyword(
                    request.getEmail().trim(), request.getUniversityId().trim());
            return ResponseEntity.ok(Map.of(
                "message", "Reset link has been sent to your registered email address."
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String to) {
        try {
            userService.sendTestEmail(to);
            return ResponseEntity.ok("Test email sent successfully to " + to);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Email failed: " + e.getMessage());
        }
    }

    // ─── Invite endpoints (public — no JWT required) ─────────────────────────────

    /**
     * GET /api/auth/invite/validate?token=xxx
     * Called by the /setup-account page on load to verify the token and pre-fill
     * the user's name/email so the page can greet them.
     */
    @GetMapping("/invite/validate")
    public ResponseEntity<?> validateInvite(@RequestParam String token) {
        try {
            User user = userService.validateInviteToken(token);
            return ResponseEntity.ok(Map.of(
                "email",    user.getEmail(),
                "name",     user.getName() != null ? user.getName() : "",
                "username", user.getUsername() != null ? user.getUsername() : "",
                "role",     user.getRole().name()
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * POST /api/auth/invite/complete
     * Body: { token, password }
     * Called when user chooses "Set campus password" path on /setup-account.
     * Returns a full JWT so the user is automatically logged in.
     */
    @PostMapping("/invite/complete")
    public ResponseEntity<?> completeInvite(@Valid @RequestBody InviteCompleteRequest request) {
        try {
            User user = userService.completeInviteWithPassword(
                    request.getToken(), request.getPassword());
            String token = jwtTokenProvider.generateToken(
                    user.getId(), user.getEmail(), user.getRole().name());
            return ResponseEntity.ok(LoginResponse.builder()
                    .token(token).id(user.getId()).name(user.getName())
                    .email(user.getEmail()).role(user.getRole().name())
                    .profilePicture(user.getProfilePicture()).build());
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
    @Data public static class TwoFactorLoginRequest  { private String tempToken; private String code; }
    @Data public static class ForgotPasswordRequest  { private String email; private String universityId; }
    @Data public static class ResetPasswordRequest   { private String keyword; private String newPassword; }

    // ─── Self-registration: submit University ID after Google login ───────────────

    /**
     * POST /api/auth/submit-university-id  (public)
     * Body: { "pendingToken": "...", "universityId": "s12345" }
     * Called after a new Google user enters their University ID on the frontend.
     */
    @PostMapping("/submit-university-id")
    public ResponseEntity<?> submitUniversityId(@RequestBody SubmitUniversityIdRequest request) {
        try {
            java.util.Map<String, String> info =
                    jwtTokenProvider.extractPendingRegistrationInfo(request.getPendingToken());
            if (info == null)
                return ResponseEntity.badRequest().body(
                        "Session expired. Please sign in with Google again.");

            userService.createRegistrationRequest(
                    info.get("email"), info.get("googleId"),
                    info.get("name"),  info.get("picture"),
                    request.getUniversityId());

            return ResponseEntity.ok("Registration request submitted. Please wait for admin approval.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Add to the inner DTO section at the bottom of the class:
    @Data public static class SubmitUniversityIdRequest {
        private String pendingToken;
        private String universityId;
    }
}