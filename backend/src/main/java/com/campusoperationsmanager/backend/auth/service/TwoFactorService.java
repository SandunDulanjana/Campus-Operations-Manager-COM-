package com.campusoperationsmanager.backend.auth.service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.repository.UserRepository;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TwoFactorService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int OTP_EXPIRY_MINUTES = 10;

    // ─── TOTP ─────────────────────────────────────────────────────────────────

    public String generateTotpSecret() {
        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        return secretGenerator.generate();
    }

    public String generateQrCodeBase64(String secret, String email) throws QrGenerationException {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("Smart Campus Hub")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        QrGenerator qrGenerator = new ZxingPngQrGenerator();
        byte[] imageData = qrGenerator.generate(data);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageData);
    }

    public boolean verifyTotpCode(String secret, String code) {
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        return verifier.isValidCode(secret, code);
    }

    // ─── SMS — step 1: send OTP to phone ──────────────────────────────────────

    /**
     * Validates phone format, stores it as pendingPhone, generates a 6-digit OTP.
     * DEV MODE: returns the OTP. In production, send via SMS and return null.
     */
    public String sendPhoneVerificationOtp(Long userId, String phone) {
        if (phone == null || phone.isBlank()) {
            throw new RuntimeException("Please enter a valid phone number.");
        }
        String cleanPhone = phone.trim();
        if (cleanPhone.length() < 7 || cleanPhone.length() > 20) {
            throw new RuntimeException("Phone number must be between 7 and 20 characters.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        user.setPendingPhone(cleanPhone);
        user.setPhoneVerifyCode(otp);
        user.setPhoneVerifyExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);

        log.info("Phone OTP generated for user: {} phone: {} [DEV MODE]", user.getEmail(), cleanPhone);
        return otp; // ⚠️ Remove in production — send via Twilio/SMS instead
    }

    // ─── SMS — step 2: verify OTP and enable SMS 2FA ─────────────────────────

    public void verifyPhoneAndEnableSms(Long userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPhoneVerifyCode() == null || user.getPhoneVerifyExpiry() == null) {
            throw new RuntimeException("No pending phone verification. Please restart setup.");
        }
        if (LocalDateTime.now().isAfter(user.getPhoneVerifyExpiry())) {
            throw new RuntimeException("Verification code has expired. Please request a new one.");
        }
        if (!user.getPhoneVerifyCode().equals(code.trim())) {
            throw new RuntimeException("Invalid code. Please try again.");
        }

        // Move pending phone to actual phone, enable SMS 2FA, clear verification state
        user.setPhone(user.getPendingPhone());
        user.setTwoFactorEnabled(true);
        user.setTwoFactorMethod("SMS");
        user.setPendingPhone(null);
        user.setPhoneVerifyCode(null);
        user.setPhoneVerifyExpiry(null);
        user.setSmsOtpCode(null);
        user.setSmsOtpExpiry(null);
        userRepository.save(user);
        log.info("SMS 2FA enabled → user: {}", user.getEmail());
    }

    // ─── Login-time SMS OTP ────────────────────────────────────────────────────

    public String storeSmsOtp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        user.setSmsOtpCode(otp);
        user.setSmsOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);
        log.info("Login SMS OTP generated for user: {} [DEV MODE]", user.getEmail());
        return otp; // ⚠️ Remove in production
    }

    public boolean verifySmsOtp(Long userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSmsOtpCode() == null || user.getSmsOtpExpiry() == null) return false;
        if (LocalDateTime.now().isAfter(user.getSmsOtpExpiry())) return false;
        return user.getSmsOtpCode().equals(code.trim());
    }

    // ─── TOTP enable ──────────────────────────────────────────────────────────

    public void enableTotpTwoFactor(Long userId, String secret) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTwoFactorEnabled(true);
        user.setTwoFactorMethod("TOTP");
        user.setTotpSecret(secret);
        user.setSmsOtpCode(null);
        user.setSmsOtpExpiry(null);
        userRepository.save(user);
        log.info("TOTP 2FA enabled → user: {}", user.getEmail());
    }

    // ─── Password verification helper ─────────────────────────────────────────

    public boolean verifyPassword(Long userId, String rawPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getPassword() == null) return true; // Google-only: no password to check
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    // ─── Disable 2FA ──────────────────────────────────────────────────────────

    public void disableTwoFactor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTwoFactorEnabled(false);
        user.setTwoFactorMethod(null);
        user.setTotpSecret(null);
        user.setSmsOtpCode(null);
        user.setSmsOtpExpiry(null);
        userRepository.save(user);
        log.info("2FA disabled → user: {}", user.getEmail());
    }
}