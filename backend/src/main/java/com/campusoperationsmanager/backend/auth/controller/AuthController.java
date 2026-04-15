package com.campusoperationsmanager.backend.auth.controller;

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
import com.campusoperationsmanager.backend.auth.service.UserService;
import com.campusoperationsmanager.backend.security.JwtTokenProvider;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * POST /api/auth/login
     * Campus credentials login: { "username": "s12345", "password": "..." }
     * Returns a JWT token + user info on success.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // 1. Validate credentials — throws if wrong
            User user = userService.login(request.getUsername(), request.getPassword());

            // 2. Generate JWT token containing userId, email, and role
            String token = jwtTokenProvider.generateToken(
                    user.getId(), user.getEmail(), user.getRole().name()
            );

            // 3. Build and return the response
            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .profilePicture(user.getProfilePicture())
                    .build();

            return ResponseEntity.ok(response);

        } catch (RuntimeException ex) {
            // Return 401 Unauthorized with the error message
            return ResponseEntity.status(401).body(ex.getMessage());
        }
    }

    /**
     * GET /api/auth/me
     * Returns the currently logged-in user's profile.
     * Frontend calls this to refresh user info after page reload.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(userService.toDTO(user));
    }
}