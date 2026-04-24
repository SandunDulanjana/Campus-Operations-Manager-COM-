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
import com.campusoperationsmanager.backend.notification.model.NotificationType;
import com.campusoperationsmanager.backend.notification.service.EmailNotificationService;
import com.campusoperationsmanager.backend.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

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

    public User findOrCreateUser(String email, String name, String googleId, String picture) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(email).name(name).googleId(googleId)
                        .profilePicture(picture).role(User.Role.USER)
                        .registrationStatus(User.RegistrationStatus.ACTIVE)
                        .build()));
    }

    public User login(String username, String rawPassword) {
        // Use findByUsernameIgnoreCase to treat "te2001547" the same as "TE2001547"
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("Invalid University ID or password"));
        if (!user.isEnabled())
            throw new RuntimeException("Account is disabled. Contact admin.");
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
                .invitePending(user.getInviteToken() != null)
                .registrationStatus(user.getRegistrationStatus() != null
                        ? user.getRegistrationStatus().name() : "ACTIVE")
                .rejectionReason(user.getRejectionReason())
                .emailNotificationsEnabled(user.isEmailNotificationsEnabled())
                .build();
    }

    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        user.setName(request.getName().trim());
        String phone = request.getPhone();
        user.setPhone((phone != null && !phone.isBlank()) ? phone.trim() : null);
        String dept = request.getDepartment();
        user.setDepartment((dept != null && !dept.isBlank()) ? dept.trim() : null);
        user.setEmailNotificationsEnabled(request.isEmailNotificationsEnabled());
        log.info("Profile updated → user: {}", user.getEmail());
        return userRepository.save(user);
    }

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

    private static final String KEYWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int KEYWORD_LENGTH = 8;
    private static final int KEYWORD_EXPIRY_MINUTES = 15;

    public String generatePasswordResetKeyword(String email, String universityId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email address."));

        if (user.getUsername() == null || !user.getUsername().equalsIgnoreCase(universityId)) {
            throw new RuntimeException("The provided University ID does not match our records for this email.");
        }

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

        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length()-1) : frontendUrl;
        String resetUrl = base + "/reset-password?keyword=" + keyword;
        log.info("Password reset keyword generated for: {} [DEV – keyword: {}]",
                user.getEmail(), keyword);

        emailNotificationService.sendPasswordResetEmail(user.getEmail(), user.getName() != null ? user.getName() : user.getEmail(), resetUrl);

        return keyword;
    }

    public void sendTestEmail(String to) {
        emailNotificationService.sendNotificationEmail(to, "Test Connectivity", "This is a test email to verify SMTP settings.", NotificationType.REGISTRATION_APPROVED, null);
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

        emailNotificationService.sendPasswordResetSuccessEmail(user.getEmail(), user.getName() != null ? user.getName() : user.getEmail());
    }

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
                .registrationStatus(User.RegistrationStatus.ACTIVE)
                .build();

        User saved = userRepository.save(user);
        String inviteUrl = frontendUrl + "/setup-account?token=" + token;
        log.info("Pending user created: {} role: {} invite expires: {}",
                email, req.getRole(), saved.getInviteExpiry());
        emailNotificationService.sendInviteEmail(email, saved.getName() != null ? saved.getName() : email, inviteUrl);
        return Map.entry(saved, inviteUrl);
    }

    public User validateInviteToken(String token) {
        User user = userRepository.findByInviteToken(token)
                .orElseThrow(() -> new RuntimeException(
                        "This invite link is invalid or has already been used."));
        if (LocalDateTime.now().isAfter(user.getInviteExpiry()))
            throw new RuntimeException(
                    "This invite link has expired. Please ask your admin for a new one.");
        return user;
    }

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

    // ── CHANGE 5: Case-insensitive university ID comparison ──────────────────────
    // Previously used: userRepository.existsByUsername(cleanId)
    // This only does an exact match, so "IT123456789" and "it123456789" were treated
    // as different IDs. We now normalize to lowercase before saving and checking,
    // so that "IT123456789" == "it123456789" == "It123456789".
    public User createRegistrationRequest(String email, String googleId,
                                        String name, String picture, String universityId) {
        if (universityId == null || universityId.isBlank())
            throw new RuntimeException("University ID is required.");

        // CHANGE: normalize to lowercase for case-insensitive comparison
        String cleanId = universityId.trim().toLowerCase();

        if (userRepository.existsByEmail(email))
            throw new RuntimeException("An account with this email already exists.");

        // CHANGE: check against normalized (lowercase) username — all usernames are stored lowercase
        if (userRepository.existsByUsernameIgnoreCase(cleanId))
            throw new RuntimeException(
                    "This University ID (" + universityId.trim() + ") is already registered.");

        User user = User.builder()
                .email(email).googleId(googleId).name(name)
                .profilePicture(picture).username(cleanId) // stored as lowercase
                .role(User.Role.USER)
                .registrationStatus(User.RegistrationStatus.PENDING_APPROVAL)
                .enabled(false)
                .build();
        User saved = userRepository.save(user);
        log.info("New registration request: email={} universityId={}", email, cleanId);

        try {
            String adminTitle   = "📋 New Registration Request";
            String adminMessage = name + " (" + email + ") submitted a registration request "
                    + "with University ID: " + cleanId
                    + ". Please review and approve or reject from the Admin → Users panel.";

            userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ADMIN && u.isEnabled())
                    .forEach(admin -> {
                        try {
                            notificationService.createTargetedNotification(
                                    admin.getEmail(),
                                    adminTitle,
                                    adminMessage,
                                    NotificationType.REGISTRATION_REQUEST,
                                    saved.getId()
                            );
                        } catch (Exception ignored) {}
                    });
        } catch (Exception e) {
            log.warn("Failed to send admin registration-request notifications: {}", e.getMessage());
        }

        return saved;
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

        log.info("Registration APPROVED: {}", user.getEmail());

        try {
            notificationService.createTargetedNotification(
                user.getEmail(),
                "Registration Approved ✅",
                "Hello " + user.getName() + ", your Smart Campus account has been approved! "
                    + "Your University ID is: " + user.getUsername() + " and your temporary "
                    + "password is: " + dummyPassword + ". Please log in and change your password.",
                NotificationType.REGISTRATION_APPROVED,
                userId
            );
        } catch (Exception e) {
            log.warn("Failed to send approval notification: {}", e.getMessage());
        }

        // CHANGE 1: return "approved" flag so frontend can show success popup
        return Map.of("message", "User approved.", "approved", true);
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

        try {
            notificationService.createTargetedNotification(
                user.getEmail(),
                "Registration Request Declined",
                "Hello " + user.getName() + ", your Smart Campus registration request has been declined. "
                    + "Reason: " + reason + ". Please contact your administrator if you believe this is a mistake.",
                NotificationType.REGISTRATION_REJECTED,
                userId
            );
        } catch (Exception e) {
            log.warn("Failed to send rejection notification: {}", e.getMessage());
        }

        return Map.of("message", "User registration rejected.");
    }

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