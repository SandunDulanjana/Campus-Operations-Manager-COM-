package com.campusoperationsmanager.backend.auth.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusoperationsmanager.backend.auth.dto.CreateUserRequest;
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

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // ─── Core ─────────────────────────────────────────────────────────────────

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
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

    // ─── Google OAuth helpers ─────────────────────────────────────────────────

    public User consumeInviteViaGoogle(Long userId, String googleId, String name, String picture) {
        User user = getUserById(userId);
        if (user.getGoogleId() == null) user.setGoogleId(googleId);
        if (user.getProfilePicture() == null) user.setProfilePicture(picture);
        if (user.getName() == null || user.getName().isBlank()) user.setName(name);
        user.setInviteToken(null);
        user.setInviteExpiry(null);
        log.info("Invite completed via Google for: {}", user.getEmail());
        return userRepository.save(user);
    }

    public User linkGoogleAccount(Long userId, String googleId, String picture) {
        User user = getUserById(userId);
        user.setGoogleId(googleId);
        if (user.getProfilePicture() == null) user.setProfilePicture(picture);
        return userRepository.save(user);
    }

    // Keep as safety wrapper — not used by OAuth handler anymore
    public User findOrCreateUser(String email, String name, String googleId, String picture) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(email).name(name).googleId(googleId)
                        .profilePicture(picture).role(User.Role.USER)
                        .registrationStatus(User.RegistrationStatus.ACTIVE)
                        .build()));
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    public User login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        if (!user.isEnabled())
            throw new RuntimeException("Account is disabled. Contact admin.");
        if (!passwordEncoder.matches(rawPassword, user.getPassword()))
            throw new RuntimeException("Invalid username or password");
        return user;
    }

    // ─── DTO mapping ──────────────────────────────────────────────────────────

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
                .invitePending(user.getInviteToken() != null)
                // ↓ Registration status fields — belong HERE not in the builder
                .registrationStatus(user.getRegistrationStatus() != null
                        ? user.getRegistrationStatus().name() : "ACTIVE")
                .rejectionReason(user.getRejectionReason())
                .build();
    }

    // ─── Profile update ───────────────────────────────────────────────────────

    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        user.setName(request.getName().trim());
        String phone = request.getPhone();
        user.setPhone((phone != null && !phone.isBlank()) ? phone.trim() : null);
        String dept = request.getDepartment();
        user.setDepartment((dept != null && !dept.isBlank()) ? dept.trim() : null);
        log.info("Profile updated → user: {}", user.getEmail());
        return userRepository.save(user);
    }

    // ─── Password change ──────────────────────────────────────────────────────

    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = getUserById(userId);
        if (user.getPassword() != null) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank())
                throw new RuntimeException("Current password is required.");
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
                throw new RuntimeException("Current password is incorrect.");
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

    // ─── Forgot / Reset password ──────────────────────────────────────────────

    private static final String KEYWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int KEYWORD_LENGTH = 8;
    private static final int KEYWORD_EXPIRY_MINUTES = 15;

    public String generatePasswordResetKeyword(String identifier) {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException(
                        "No account found with that username or email address."));
        if (!user.isEnabled())
            throw new RuntimeException("This account is disabled. Please contact support.");

        Random random = new Random();
        StringBuilder kw = new StringBuilder(KEYWORD_LENGTH);
        for (int i = 0; i < KEYWORD_LENGTH; i++)
            kw.append(KEYWORD_CHARS.charAt(random.nextInt(KEYWORD_CHARS.length())));
        String keyword = kw.toString();

        user.setResetKeyword(keyword);
        user.setResetKeywordExpiry(LocalDateTime.now().plusMinutes(KEYWORD_EXPIRY_MINUTES));
        userRepository.save(user);
        log.info("Password reset keyword generated for: {} [DEV — keyword: {}]",
                user.getEmail(), keyword);
        return keyword;
    }

    public void resetPasswordWithKeyword(String keyword, String newPassword) {
        if (keyword == null || keyword.isBlank())
            throw new RuntimeException("Reset keyword is required.");
        User user = userRepository.findByResetKeyword(keyword.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException(
                        "Invalid reset keyword. Please check the keyword and try again."));
        if (user.getResetKeywordExpiry() == null
                || LocalDateTime.now().isAfter(user.getResetKeywordExpiry())) {
            user.setResetKeyword(null);
            user.setResetKeywordExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("This keyword has expired. Please request a new one.");
        }
        if (newPassword == null || newPassword.length() < 8)
            throw new RuntimeException("New password must be at least 8 characters.");
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetKeyword(null);
        user.setResetKeywordExpiry(null);
        userRepository.save(user);
        log.info("Password reset via keyword for: {}", user.getEmail());
    }

    // ─── Invite: Admin creates a pending user ────────────────────────────────

    private static final int TOKEN_BYTE_LENGTH = 36;

    public Map.Entry<User, String> createPendingUser(CreateUserRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email))
            throw new RuntimeException("An account with this email already exists.");

        String username = (req.getUsername() != null && !req.getUsername().isBlank())
                ? req.getUsername().trim() : null;
        if (username != null && userRepository.existsByUsername(username))
            throw new RuntimeException("Username '" + username + "' is already taken.");

        byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
        new SecureRandom().nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        String token = sb.toString();

        // ✅ FIXED: only valid User entity fields here — no DTO fields, no self-references
        User user = User.builder()
                .email(email)
                .name(req.getName().trim())
                .username(username)
                .role(User.Role.valueOf(req.getRole().toUpperCase()))
                .phone((req.getPhone() != null && !req.getPhone().isBlank())
                        ? req.getPhone().trim() : null)
                .department((req.getDepartment() != null && !req.getDepartment().isBlank())
                        ? req.getDepartment().trim() : null)
                .inviteToken(token)
                .inviteExpiry(LocalDateTime.now().plusHours(24))
                .registrationStatus(User.RegistrationStatus.ACTIVE)  // admin-invited = pre-approved
                .build();

        User saved = userRepository.save(user);
        String inviteUrl = frontendUrl + "/setup-account?token=" + token;
        log.info("Pending user created: {} role: {} invite expires: {}",
                email, req.getRole(), saved.getInviteExpiry());
        return Map.entry(saved, inviteUrl);
    }

    // ─── Invite: Validate token ───────────────────────────────────────────────

    public User validateInviteToken(String token) {
        User user = userRepository.findByInviteToken(token)
                .orElseThrow(() -> new RuntimeException(
                        "This invite link is invalid or has already been used."));
        if (LocalDateTime.now().isAfter(user.getInviteExpiry()))
            throw new RuntimeException(
                    "This invite link has expired. Please ask your admin for a new one.");
        return user;
    }

    // ─── Invite: Complete setup with a password ───────────────────────────────

    public User completeInviteWithPassword(String token, String password) {
        User user = validateInviteToken(token);
        if (password == null || password.length() < 8)
            throw new RuntimeException("Password must be at least 8 characters.");
        user.setPassword(passwordEncoder.encode(password));
        user.setInviteToken(null);
        user.setInviteExpiry(null);
        log.info("Invite completed via password for: {}", user.getEmail());
        return userRepository.save(user);
    }

    // ─── Self-registration (Google new user flow) ─────────────────────────────

    public User createRegistrationRequest(String email, String googleId,
                                          String name, String picture, String universityId) {
        if (universityId == null || universityId.isBlank())
            throw new RuntimeException("University ID is required.");
        String cleanId = universityId.trim();
        if (userRepository.existsByEmail(email))
            throw new RuntimeException("An account with this email already exists.");
        if (userRepository.existsByUsername(cleanId))
            throw new RuntimeException(
                    "This University ID (" + cleanId + ") is already registered.");

        User user = User.builder()
                .email(email).googleId(googleId).name(name)
                .profilePicture(picture).username(cleanId)
                .role(User.Role.USER)
                .registrationStatus(User.RegistrationStatus.PENDING_APPROVAL)
                .enabled(false)
                .build();
        userRepository.save(user);
        log.info("New registration request: email={} universityId={}", email, cleanId);
        return user;
    }

    public List<User> getPendingRegistrations() {
        return userRepository.findByRegistrationStatus(User.RegistrationStatus.PENDING_APPROVAL);
    }

    public Map<String, Object> approveRegistration(Long userId, String dummyPassword) {
        User user = getUserById(userId);
        if (user.getRegistrationStatus() != User.RegistrationStatus.PENDING_APPROVAL)
            throw new RuntimeException("This account is not pending approval.");
        if (dummyPassword == null || dummyPassword.length() < 6)
            throw new RuntimeException("Temporary password must be at least 6 characters.");

        user.setPassword(passwordEncoder.encode(dummyPassword));
        user.setRegistrationStatus(User.RegistrationStatus.ACTIVE);
        user.setEnabled(true);
        user.setRejectionReason(null);
        userRepository.save(user);

        log.info("Registration APPROVED: {} [DEV — dummyPwd: {}]", user.getEmail(), dummyPassword);
        return Map.of(
            "message", "User approved.",
            "devEmail", Map.of(
                "to",      user.getEmail(),
                "subject", "Your Smart Campus account is approved!",
                "body",    "Hello " + user.getName() + ",\n\n"
                         + "Your registration has been approved.\n"
                         + "University ID : " + user.getUsername() + "\n"
                         + "Temp Password : " + dummyPassword + "\n\n"
                         + "Please log in and change your password.",
                "devNote", "⚠️ Dev mode — wire a real email service for production"
            )
        );
    }

    public Map<String, Object> rejectRegistration(Long userId, String reason) {
        User user = getUserById(userId);
        if (user.getRegistrationStatus() != User.RegistrationStatus.PENDING_APPROVAL)
            throw new RuntimeException("This account is not pending approval.");
        if (reason == null || reason.isBlank())
            throw new RuntimeException("A rejection reason is required.");

        user.setRegistrationStatus(User.RegistrationStatus.REJECTED);
        user.setRejectionReason(reason.trim());
        user.setEnabled(false);
        userRepository.save(user);

        log.info("Registration REJECTED: {} reason: {}", user.getEmail(), reason);
        return Map.of(
            "message", "User registration rejected.",
            "devEmail", Map.of(
                "to",      user.getEmail(),
                "subject", "Your Smart Campus registration",
                "body",    "Hello " + user.getName() + ",\n\n"
                         + "Your registration request has been declined.\n"
                         + "Reason: " + reason + "\n\n"
                         + "Contact your administrator if you think this is a mistake.",
                "devNote", "⚠️ Dev mode — wire a real email service for production"
            )
        );
    }

        // ─── Permanent delete (only for already-deactivated accounts) ────────────────
    public void permanentDeleteUser(Long userId) {
        User user = getUserById(userId);
        if (user.isEnabled()) {
            throw new RuntimeException(
                "Only deactivated accounts can be permanently deleted. " +
                "Please deactivate the user first.");
        }
        userRepository.deleteById(userId);
        log.info("User permanently deleted: id={} email={}", userId, user.getEmail());
    }

}