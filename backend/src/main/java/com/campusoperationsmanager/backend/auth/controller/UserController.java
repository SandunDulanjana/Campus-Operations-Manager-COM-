package com.campusoperationsmanager.backend.auth.controller;

import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users
     * ADMIN ONLY — get all registered users.
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
     * ADMIN ONLY — change a user's role.
     * Body: { "role": "TECHNICIAN" }
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {

        User updated = userService.updateRole(id, request.getRole());
        return ResponseEntity.ok(userService.toDTO(updated));
    }

    /**
     * DELETE /api/users/{id}
     * ADMIN ONLY — deactivate user (soft delete).
     * Returns 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    static class RoleUpdateRequest {
        @NotBlank(message = "Role is required")
        private String role;
    }
}