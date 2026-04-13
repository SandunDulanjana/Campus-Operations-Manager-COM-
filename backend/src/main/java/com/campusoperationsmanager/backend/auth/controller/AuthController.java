package com.campusoperationsmanager.backend.auth.controller;

import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * GET /api/auth/me
     * Returns the currently logged-in user's profile.
     * Frontend calls this after receiving the JWT token.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(
            @AuthenticationPrincipal Long userId) {

        User user = userService.getUserById(userId);
        return ResponseEntity.ok(userService.toDTO(user));
    }
}