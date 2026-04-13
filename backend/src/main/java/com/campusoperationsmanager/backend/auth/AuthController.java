package com.campusoperationsmanager.backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * Handles the currently logged-in user's own profile.
 * Endpoint: /api/auth/...
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * GET /api/auth/me
     *
     * "Who am I?" — Returns the current user's profile.
     * Frontend calls this on app load to know who's logged in.
     *
     * @AuthenticationPrincipal — Spring injects the userId
     * we stored in the JWT filter (the Long we set as principal)
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(
            @AuthenticationPrincipal Long userId) {

        User user = userService.getUserById(userId);
        return ResponseEntity.ok(userService.toDTO(user));
    }
}