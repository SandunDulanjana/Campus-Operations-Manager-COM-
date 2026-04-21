package com.campusoperationsmanager.backend.auth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusoperationsmanager.backend.auth.dto.CreateUserRequest;
import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;

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

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> permanentDeleteUser(@PathVariable Long id) {
        try {
            userService.permanentDeleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @Data
    public static class RoleUpdateRequest {
        @NotBlank(message = "Role is required")
        private String role;
    }

    // WHY: Admin creates a pending (invite-only) user. Returns the user record
//      plus the copyable invite URL the admin sends to the new user.
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            var entry = userService.createPendingUser(request);
            User saved       = entry.getKey();
            String inviteUrl = entry.getValue();
            return ResponseEntity.status(201).body(Map.of(
                "user",      userService.toDTO(saved),
                "inviteUrl", inviteUrl
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // ─── Registration request management (admin only) ─────────────────────────────

    /**
     * GET /api/users/registration-requests
     * Returns all users with PENDING_APPROVAL status.
     */
    @GetMapping("/registration-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getRegistrationRequests() {
        return ResponseEntity.ok(
                userService.getPendingRegistrations().stream()
                        .map(userService::toDTO).toList());
    }

    /**
     * POST /api/users/{id}/approve
     * Body: { "dummyPassword": "Temp@1234" }
     * Approves the registration, sets a temporary password, triggers email.
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRegistration(
            @PathVariable Long id,
            @RequestBody ApproveRequest request) {
        try {
            return ResponseEntity.ok(userService.approveRegistration(id, request.getDummyPassword()));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * POST /api/users/{id}/reject
     * Body: { "reason": "..." }
     * Rejects the registration with a reason.
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRegistration(
            @PathVariable Long id,
            @RequestBody RejectRequest request) {
        try {
            return ResponseEntity.ok(userService.rejectRegistration(id, request.getReason()));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // ─── Inner DTOs ───────────────────────────────────────────────────────────────
    @Data public static class ApproveRequest { private String dummyPassword; }
    @Data public static class RejectRequest  { private String reason; }

}