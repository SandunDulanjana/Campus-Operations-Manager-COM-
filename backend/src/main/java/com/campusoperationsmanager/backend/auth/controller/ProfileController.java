package com.campusoperationsmanager.backend.auth.controller;

import com.campusoperationsmanager.backend.auth.dto.UpdatePasswordRequest;
import com.campusoperationsmanager.backend.auth.dto.UpdateProfileRequest;
import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        User updated = userService.updateProfile(userId, request);
        return ResponseEntity.ok(userService.toDTO(updated));
    }

    /** PUT /api/profile/password — change password (local accounts + Google users setting one) */
    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdatePasswordRequest request) {
        userService.updatePassword(userId, request);
        return ResponseEntity.ok("Password updated successfully");
    }

    /** PUT /api/profile/picture — upload profile picture as base64 data-URL */
    @PutMapping("/picture")
    public ResponseEntity<UserDTO> updateProfilePicture(
            @AuthenticationPrincipal Long userId,
            @RequestBody ProfilePictureRequest request) {
        User updated = userService.updateProfilePicture(userId, request.getImageData());
        return ResponseEntity.ok(userService.toDTO(updated));
    }

    @Data
    static class ProfilePictureRequest {
        private String imageData;   // "data:image/jpeg;base64,..."
    }
}