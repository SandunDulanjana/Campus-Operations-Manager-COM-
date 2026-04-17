package com.campusoperationsmanager.backend.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusoperationsmanager.backend.auth.dto.UpdatePasswordRequest;
import com.campusoperationsmanager.backend.auth.dto.UpdateProfileRequest;
import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateRole(Long userId, String newRole) {
        User user = getUserById(userId);
        user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        log.info("Role updated → user: {} role: {}", user.getEmail(), newRole);
        return userRepository.save(user);
    }

    public void deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User deactivated: {}", user.getEmail());
    }

    public User findOrCreateUser(String email, String name, String googleId, String picture) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("New user via Google: {}", email);
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

    public User login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        if (!user.isEnabled()) throw new RuntimeException("Account is disabled. Contact admin.");
        if (!passwordEncoder.matches(rawPassword, user.getPassword()))
            throw new RuntimeException("Invalid username or password");
        return user;
    }

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .hasPassword(user.getPassword() != null)
                .createdAt(user.getCreatedAt())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .twoFactorMethod(user.getTwoFactorMethod())
                .build();
    }

    // ─── Profile update ───────────────────────────────────────────────────────

    /**
     * FIX (Feature 3): Always explicitly set phone and department so nulls
     * propagate correctly back to the response DTO. Previously, if the request
     * sent an empty string, the field became null in the DB but the DTO
     * returned stale data because the field wasn't updated when null.
     */
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        user.setName(request.getName().trim());

        // Always update phone — empty string → null (clears it)
        String phone = request.getPhone();
        user.setPhone((phone != null && !phone.isBlank()) ? phone.trim() : null);

        // Always update department — same rule
        String dept = request.getDepartment();
        user.setDepartment((dept != null && !dept.isBlank()) ? dept.trim() : null);

        log.info("Profile updated → user: {}", user.getEmail());
        return userRepository.save(user);
    }

    // ─── Password change ──────────────────────────────────────────────────────

    /**
     * FIX (Feature 4): Now throws RuntimeException with a clear message for
     * missing or wrong current password, which ProfileController converts to 400.
     */
    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = getUserById(userId);

        if (user.getPassword() != null) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new RuntimeException("Current password is required.");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect.");
            }
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password updated → user: {}", user.getEmail());
    }

    public User updateProfilePicture(Long userId, String imageData) {
        User user = getUserById(userId);
        user.setProfilePicture(imageData);
        return userRepository.save(user);
    }

    // ─── Forgot password ──────────────────────────────────────────────────────

    private static final String KEYWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int KEYWORD_LENGTH = 8;
    private static final int KEYWORD_EXPIRY_MINUTES = 15;

    /**
     * Feature 5: Generates a reset keyword for the user identified by username or email.
     * DEV MODE: returns the keyword. In production, email it instead.
     */
    public String generatePasswordResetKeyword(String identifier) {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException(
                        "No account found with that username or email address."));

        if (!user.isEnabled()) {
            throw new RuntimeException("This account is disabled. Please contact support.");
        }

        // Generate random keyword
        Random random = new Random();
        StringBuilder kw = new StringBuilder(KEYWORD_LENGTH);
        for (int i = 0; i < KEYWORD_LENGTH; i++) {
            kw.append(KEYWORD_CHARS.charAt(random.nextInt(KEYWORD_CHARS.length())));
        }
        String keyword = kw.toString();

        user.setResetKeyword(keyword);
        user.setResetKeywordExpiry(LocalDateTime.now().plusMinutes(KEYWORD_EXPIRY_MINUTES));
        userRepository.save(user);

        log.info("Password reset keyword generated for: {} [DEV MODE — keyword: {}]",
                user.getEmail(), keyword);
        return keyword; // ⚠️ In production: send via email and return null
    }

    /**
     * Feature 5: Verifies the keyword and sets a new password.
     */
    public void resetPasswordWithKeyword(String keyword, String newPassword) {
        if (keyword == null || keyword.isBlank()) {
            throw new RuntimeException("Reset keyword is required.");
        }
        User user = userRepository.findByResetKeyword(keyword.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException(
                        "Invalid reset keyword. Please check the keyword and try again."));

        if (user.getResetKeywordExpiry() == null
                || LocalDateTime.now().isAfter(user.getResetKeywordExpiry())) {
            // Clear expired keyword
            user.setResetKeyword(null);
            user.setResetKeywordExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("This keyword has expired. Please request a new one.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetKeyword(null);
        user.setResetKeywordExpiry(null);
        userRepository.save(user);
        log.info("Password reset via keyword for: {}", user.getEmail());
    }
}