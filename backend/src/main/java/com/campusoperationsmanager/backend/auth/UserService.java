package com.campusoperationsmanager.backend.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * Find user by ID — throws exception if not found.
     * Used by controllers to get current user.
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    /**
     * Get all users — ADMIN dashboard feature.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Change a user's role — ADMIN only.
     * e.g. promote staff to TECHNICIAN so they can handle tickets.
     */
    public User updateRole(Long userId, String newRole) {
        User user = getUserById(userId);

        // Role.valueOf throws IllegalArgumentException for invalid roles
        // Spring will convert that to a 400 Bad Request automatically
        user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        log.info("Role updated for user {}: {}", user.getEmail(), newRole);
        return userRepository.save(user);
    }

    /**
     * Soft-delete a user — ADMIN only.
     * Sets enabled=false instead of deleting row.
     * This keeps the audit trail (who made what bookings, etc.)
     */
    public void deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User deactivated: {}", user.getEmail());
    }

    /**
     * Find or create user after Google login.
     * Called by OAuth2AuthenticationSuccessHandler.
     */
    public User findOrCreateUser(String email, String name,
                                  String googleId, String picture) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("New user registering via Google: {}", email);
                    return userRepository.save(
                            User.builder()
                                    .email(email)
                                    .name(name)
                                    .googleId(googleId)
                                    .profilePicture(picture)
                                    .role(User.Role.USER)
                                    .build()
                    );
                });
    }

    // Helper — convert entity to DTO (never send raw entity to frontend)
    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}