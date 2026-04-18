package com.campusoperationsmanager.backend.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String picture  = oAuth2User.getAttribute("picture");

        log.info("Google OAuth2 success: {}", email);

        Optional<User> optUser = userService.findByEmail(email);

        // ── Brand-new user: never seen this email ──────────────────────────────
        if (optUser.isEmpty()) {
            String pendingToken = jwtTokenProvider.generatePendingRegistrationToken(
                    email, googleId, name, picture);
            redirect(request, response, "/oauth/callback",
                    "status", "needs_university_id",
                    "pendingToken", pendingToken);
            return;
        }

        User user = optUser.get();

        // ── Admin-invited user completing via Google ───────────────────────────
        if (user.getInviteToken() != null) {
            if (user.getInviteExpiry() != null && LocalDateTime.now().isBefore(user.getInviteExpiry())) {
                user = userService.consumeInviteViaGoogle(user.getId(), googleId, name, picture);
                // fall through to normal login below
            }
            // If invite expired, fall through — will hit ACTIVE check and succeed
        }

        // ── Self-registration waiting for admin ────────────────────────────────
        if (user.getRegistrationStatus() == User.RegistrationStatus.PENDING_APPROVAL) {
            redirect(request, response, "/oauth/callback", "status", "pending_approval");
            return;
        }

        // ── Admin rejected ─────────────────────────────────────────────────────
        if (user.getRegistrationStatus() == User.RegistrationStatus.REJECTED) {
            String reason = user.getRejectionReason() != null ? user.getRejectionReason() : "";
            redirect(request, response, "/oauth/callback",
                    "status", "rejected", "reason", reason);
            return;
        }

        // ── Account disabled by admin ──────────────────────────────────────────
        if (!user.isEnabled()) {
            redirect(request, response, "/oauth/callback", "status", "disabled");
            return;
        }

        // ── Link Google account if first Google login ──────────────────────────
        if (user.getGoogleId() == null) {
            user = userService.linkGoogleAccount(user.getId(), googleId, picture);
        }

        // ── Normal successful login ────────────────────────────────────────────
        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name());
        redirect(request, response, "/oauth/callback", "token", token);
    }

    // Helper to avoid repeated UriComponentsBuilder boilerplate
    private void redirect(HttpServletRequest req, HttpServletResponse res,
                          String path, String... params) throws IOException {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendUrl + path);
        for (int i = 0; i < params.length - 1; i += 2) {
            builder.queryParam(params[i], params[i + 1]);
        }
        getRedirectStrategy().sendRedirect(req, res, builder.build().toUriString());
    }
}