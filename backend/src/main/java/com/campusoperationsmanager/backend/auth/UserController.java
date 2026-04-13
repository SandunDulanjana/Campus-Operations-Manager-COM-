package com.campusoperationsmanager.backend.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Handles user management by ADMIN.
 * Endpoint: /api/users/...
 *
 * Separated from AuthController to keep responsibilities clean:
 * - AuthController = "my own profile"
 * - UserController = "manage other users (admin)"
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users
     * ADMIN ONLY — list all users.
     *
     * @PreAuthorize checks the role BEFORE entering this method.
     * If not ADMIN → 403 Forbidden automatically.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers()
                .stream()
                .map(userService::toDTO)
                .toList();
        return ResponseEntity.ok(users);
    }

    /**
     * PUT /api/users/{id}/role
     * ADMIN ONLY — promote/demote a user's role.
     *
     * Request body: { "role": "TECHNICIAN" }
     * Response: updated user object
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {

        User updated = userService.updateRole(id, request.getRole());
        return ResponseEntity.ok(userService.toDTO(updated));
    }

    /**
     * DELETE /api/users/{id}
     * ADMIN ONLY — deactivate a user (soft delete).
     *
     * Returns 204 No Content — success with no body.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    // Inner class for request body — small enough to keep here
    @Data
    static class RoleUpdateRequest {
        @NotBlank(message = "Role is required")
        private String role;
    }
}