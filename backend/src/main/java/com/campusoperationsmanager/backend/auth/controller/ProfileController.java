package com.campusoperationsmanager.backend.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusoperationsmanager.backend.auth.dto.UpdatePasswordRequest;
import com.campusoperationsmanager.backend.auth.dto.UpdateProfileRequest;
import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    /** GET /api/profile — return own profile */
    @GetMapping
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(userService.toDTO(user));
    }

    /** PUT /api/profile — update name / phone / department */
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            User updated = userService.updateProfile(userId, request);
            return ResponseEntity.ok(userService.toDTO(updated));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /** PUT /api/profile/password — change password */
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdatePasswordRequest request) {
        try {
            userService.updatePassword(userId, request);
            return ResponseEntity.ok("Password updated successfully");
        } catch (RuntimeException ex) {
            // Returns 400 with the plain error message string so frontend can display it
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /** PUT /api/profile/picture — upload profile picture */
    @PutMapping("/picture")
    public ResponseEntity<UserDTO> updateProfilePicture(
            @AuthenticationPrincipal Long userId,
            @RequestBody ProfilePictureRequest request) {
        User updated = userService.updateProfilePicture(userId, request.getImageData());
        return ResponseEntity.ok(userService.toDTO(updated));
    }

    @Data
    static class ProfilePictureRequest {
        private String imageData;
    }
}