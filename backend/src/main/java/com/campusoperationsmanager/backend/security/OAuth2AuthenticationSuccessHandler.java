package com.campusoperationsmanager.backend.security;

import java.io.IOException;

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

        User user = userService.findOrCreateUser(email, name, googleId, picture);

        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        // Redirect to React OAuthCallback with token in query parameter
        String targetUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth/callback")
                .queryParam("token", token)
                .build()
                .toUriString();

        log.info("Redirecting to React callback: {}", targetUrl);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}