package com.campusoperationsmanager.backend.auth.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;



@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(unique = true, nullable = false)
    private String email;

    // Campus login username (e.g. "s12345")
    @Column(unique = true)
    private String username;

    // BCrypt hashed password — never stored as plain text
    @Column
    private String password;

    private String name;

    @Column(name = "profile_picture", columnDefinition = "TEXT")
    private String profilePicture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String department;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User() {}

   @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) role = Role.USER;
        if (registrationStatus == null) registrationStatus = RegistrationStatus.ACTIVE; 
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Column(name = "two_factor_enabled", nullable = false)
    @Builder.Default
    private boolean twoFactorEnabled = false;

    // "SMS" or "TOTP" — null when disabled
    @Column(name = "two_factor_method", length = 10)
    private String twoFactorMethod;

    // Encrypted TOTP secret (for Authenticator app)
    @Column(name = "totp_secret", length = 100)
    private String totpSecret;

    // Temporary SMS OTP (dev demo — in production send via Twilio)
    @Column(name = "sms_otp_code", length = 10)
    private String smsOtpCode;

    @Column(name = "sms_otp_expiry")
    private LocalDateTime smsOtpExpiry;

    // ─── Phone verification (before SMS 2FA setup) ────────────────────────────────
    @Column(name = "pending_phone", length = 20)
    private String pendingPhone;

    @Column(name = "phone_verify_code", length = 10)
    private String phoneVerifyCode;

    @Column(name = "phone_verify_expiry")
    private LocalDateTime phoneVerifyExpiry;

    // ─── Password reset ───────────────────────────────────────────────────────────
    @Column(name = "reset_keyword", length = 20)
    private String resetKeyword;

    @Column(name = "reset_keyword_expiry")
    private LocalDateTime resetKeywordExpiry;

    // ─── Invite-based onboarding ─────────────────────────────────────────────────
    // WHY: Admin creates a pending user record. Token is single-use + 24h expiry.
    //      Cleared to null once user completes setup (password or Google path).
    @Column(name = "invite_token", length = 64)
    private String inviteToken;

    @Column(name = "invite_expiry")
    private LocalDateTime inviteExpiry;

    public enum Role {
        USER,
        MAINTENANCEMNG,
        RECOURSEMNG,
        BOOKINGMNG,
        ADMIN,
        TECHNICIAN
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", columnDefinition = "VARCHAR(30) DEFAULT 'ACTIVE'")
    @Builder.Default
    private RegistrationStatus registrationStatus = RegistrationStatus.ACTIVE;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    public enum RegistrationStatus {
        ACTIVE,           // fully set up — can log in
        PENDING_APPROVAL, // submitted University ID, waiting for admin
        REJECTED          // admin rejected the registration
    }
}