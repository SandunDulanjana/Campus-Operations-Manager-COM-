package com.campusoperationsmanager.backend.notification.service;

import com.campusoperationsmanager.backend.auth.repository.UserRepository;
import com.campusoperationsmanager.backend.notification.model.NotificationType;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ── Targeted notification email (booking, ticket, comment, registration) ──
    @Async
    public void sendNotificationEmail(String toEmail,
                                      String title,
                                      String message,
                                      NotificationType type,
                                      Long referenceId) {
        
        // Skip check for registration emails, otherwise check user preference
        if (type != NotificationType.REGISTRATION_APPROVED && 
            type != NotificationType.REGISTRATION_REJECTED &&
            type != NotificationType.REGISTRATION_REQUEST) {
            
            boolean enabled = userRepository.findByEmail(toEmail)
                    .map(u -> u.isEmailNotificationsEnabled())
                    .orElse(true); // Default to true if user not found (e.g. system emails)
            
            if (!enabled) {
                log.info("Skipping email notification for {} (preferences disabled)", toEmail);
                return;
            }
        }

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromAddress, "Smart Campus Operations Hub");
            helper.setTo(toEmail);
            helper.setSubject(buildSubject(type, title));
            helper.setText(buildNotificationHtml(title, message, type, referenceId), true);
            mailSender.send(mime);
            log.info("Email notification sent: type={} to={}", type, toEmail);
        } catch (Exception e) {
            // Email failure must never break the main flow in async contexts,
            // but we throw here so that diagnostic operations can catch it.
            log.warn("Email notification failed for {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }

    // ── Invite email ──────────────────────────────────────────────────────────
    @Async
    public void sendInviteEmail(String toEmail, String toName, String inviteUrl) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromAddress, "Smart Campus Operations Hub");
            helper.setTo(toEmail);
            helper.setSubject("You're Invited – Set Up Your Smart Campus Account");
            helper.setText(buildInviteHtml(toName, inviteUrl), true);
            mailSender.send(mime);
            log.info("Invite email sent to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Invite email failed for {}: {}", toEmail, e.getMessage());
        }
    }

    // ── Password reset email ──────────────────────────────────────────────────
    @Async
    public void sendPasswordResetEmail(String toEmail, String toName, String resetUrl) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromAddress, "Smart Campus Operations Hub");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Smart Campus Password");
            helper.setText(buildPasswordResetHtml(toName, resetUrl), true);
            mailSender.send(mime);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Password reset email failed for {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Password reset email failed: " + e.getMessage());
        }
    }

    // ── Password reset success email ──────────────────────────────────────────
    @Async
    public void sendPasswordResetSuccessEmail(String toEmail, String toName) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromAddress, "Smart Campus Operations Hub");
            helper.setTo(toEmail);
            helper.setSubject("Password Security Alert – Smart Campus");
            helper.setText(buildPasswordResetSuccessHtml(toName), true);
            mailSender.send(mime);
            log.info("Password reset success email sent to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Password reset success email failed for {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildPasswordResetSuccessHtml(String name) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f5f7f6;font-family:Arial,sans-serif;">
              <div style="max-width:580px;margin:40px auto;background:#fff;
                          border-radius:12px;overflow:hidden;
                          box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <div style="background:#16a34a;padding:22px 32px;">
                  <p style="margin:0;color:#fff;font-size:13px;opacity:.85;
                             letter-spacing:.06em;text-transform:uppercase;">
                    Smart Campus Operations Hub
                  </p>
                </div>

                <div style="padding:32px;">
                  <h2 style="margin:0 0 14px;color:#10212b;font-size:20px;font-weight:700;">
                    Password Successfully Changed
                  </h2>
                  <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.65;">
                    Hello <strong>%s</strong>,<br><br>
                    This is a confirmation that your password has been successfully changed for your account.
                    <br><br>
                    <strong>If you did not perform this action, please contact your administrator immediately.</strong>
                  </p>
                  <div style="text-align:center;margin-top:28px;">
                    <a href="%s"
                       style="background:#16a34a;color:#fff;padding:12px 28px;
                              border-radius:8px;text-decoration:none;font-weight:600;
                              font-size:14px;display:inline-block;">
                      Continue to Hub
                    </a>
                  </div>
                </div>

                <div style="background:#f5f7f6;padding:18px 32px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    Automated message from Smart Campus Operations Hub.
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(esc(name), frontendUrl);
    }

    private String buildPasswordResetHtml(String name, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f5f7f6;font-family:Arial,sans-serif;">
              <div style="max-width:580px;margin:40px auto;background:#fff;
                          border-radius:12px;overflow:hidden;
                          box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <div style="background:#1b7f7b;padding:22px 32px;">
                  <p style="margin:0;color:#fff;font-size:13px;opacity:.85;
                             letter-spacing:.06em;text-transform:uppercase;">
                    Smart Campus Operations Hub
                  </p>
                </div>

                <div style="padding:32px;">
                  <h2 style="margin:0 0 14px;color:#10212b;font-size:20px;font-weight:700;">
                    Password Reset Request
                  </h2>
                  <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.65;">
                    Hello <strong>%s</strong>,<br><br>
                    You (or someone using your email) requested a password reset for your Smart Campus account.
                    Click the button below to choose a new password. This link expires in <strong>15 minutes</strong>.
                  </p>
                  <div style="text-align:center;margin-top:28px;">
                    <a href="%s"
                       style="background:#1b7f7b;color:#fff;padding:12px 28px;
                              border-radius:8px;text-decoration:none;font-weight:600;
                              font-size:14px;display:inline-block;">
                      Reset Password
                    </a>
                  </div>
                  <p style="margin-top:24px;color:#6b7280;font-size:13px;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                  <p style="margin-top:12px;color:#6b7280;font-size:13px;">
                    Or copy this link into your browser:<br>
                    <a href="%s" style="color:#1b7f7b;word-break:break-all;">%s</a>
                  </p>
                </div>

                <div style="background:#f5f7f6;padding:18px 32px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    Automated message from Smart Campus Operations Hub.
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(esc(name), resetUrl, resetUrl, resetUrl);
    }

    private String buildSubject(NotificationType type, String title) {
        return switch (type) {
            case BOOKING_APPROVED      -> "✅ Booking Approved – Smart Campus";
            case BOOKING_REJECTED      -> "❌ Booking Rejected – Smart Campus";
            case BOOKING_CANCELLED     -> "⚠️ Booking Cancelled – Smart Campus";
            case TICKET_STATUS_CHANGED -> "🔔 Ticket Update – Smart Campus";
            case COMMENT_ADDED         -> "💬 New Comment on Your Ticket – Smart Campus";
            case REGISTRATION_REQUEST  -> "📋 New Registration Request – Smart Campus";
            case REGISTRATION_APPROVED -> "✅ Registration Approved – Smart Campus";
            case REGISTRATION_REJECTED -> "❌ Registration Request Declined – Smart Campus";
            default                    -> title + " – Smart Campus";
        };
    }

    private String accentColor(NotificationType type) {
        return switch (type) {
            case BOOKING_APPROVED, REGISTRATION_APPROVED -> "#16a34a";
            case BOOKING_REJECTED, REGISTRATION_REJECTED -> "#dc2626";
            case BOOKING_CANCELLED                       -> "#d97706";
            default                                      -> "#1b7f7b";
        };
    }

    private String buildNotificationHtml(String title,
                                         String message,
                                         NotificationType type,
                                         Long referenceId) {
        String accent = accentColor(type);

        // Build action button if we have a meaningful link
        String actionBtn = "";
        if (referenceId != null) {
            String path = switch (type) {
                case BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED
                        -> "/bookings";
                case TICKET_STATUS_CHANGED, COMMENT_ADDED
                        -> "/tickets/" + referenceId;
                case REGISTRATION_REQUEST
                        -> "/admin/users";
                default -> "";
            };
            if (!path.isEmpty()) {
                actionBtn = """
                    <div style="text-align:center;margin-top:28px;">
                      <a href="%s%s"
                         style="background:%s;color:#fff;padding:12px 28px;
                                border-radius:8px;text-decoration:none;font-weight:600;
                                font-size:14px;display:inline-block;">
                        View Details
                      </a>
                    </div>
                    """.formatted(frontendUrl, path, accent);
            }
        }

        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f5f7f6;font-family:Arial,sans-serif;">
              <div style="max-width:580px;margin:40px auto;background:#fff;
                          border-radius:12px;overflow:hidden;
                          box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <div style="background:%s;padding:22px 32px;">
                  <p style="margin:0;color:#fff;font-size:13px;opacity:.85;
                             letter-spacing:.06em;text-transform:uppercase;">
                    Smart Campus Operations Hub
                  </p>
                </div>

                <div style="padding:32px;">
                  <h2 style="margin:0 0 14px;color:#10212b;font-size:20px;font-weight:700;">
                    %s
                  </h2>
                  <p style="margin:0;color:#374151;font-size:15px;line-height:1.65;">
                    %s
                  </p>
                  %s
                </div>

                <div style="background:#f5f7f6;padding:18px 32px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    Automated message from Smart Campus Operations Hub.
                    Do not reply to this email.
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(accent, esc(title), esc(message), actionBtn);
    }

    private String buildInviteHtml(String name, String inviteUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f5f7f6;font-family:Arial,sans-serif;">
              <div style="max-width:580px;margin:40px auto;background:#fff;
                          border-radius:12px;overflow:hidden;
                          box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <div style="background:#1b7f7b;padding:22px 32px;">
                  <p style="margin:0;color:#fff;font-size:13px;opacity:.85;
                             letter-spacing:.06em;text-transform:uppercase;">
                    Smart Campus Operations Hub
                  </p>
                </div>

                <div style="padding:32px;">
                  <h2 style="margin:0 0 14px;color:#10212b;font-size:20px;font-weight:700;">
                    You've Been Invited!
                  </h2>
                  <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.65;">
                    Hello <strong>%s</strong>,<br><br>
                    An administrator has created a Smart Campus account for you.
                    Click below to set your password and activate your account.
                    This invite link expires in <strong>24 hours</strong>.
                  </p>
                  <div style="text-align:center;margin-top:28px;">
                    <a href="%s"
                       style="background:#1b7f7b;color:#fff;padding:12px 28px;
                              border-radius:8px;text-decoration:none;font-weight:600;
                              font-size:14px;display:inline-block;">
                      Set Up My Account
                    </a>
                  </div>
                  <p style="margin-top:24px;color:#6b7280;font-size:13px;">
                    Or copy this link into your browser:<br>
                    <a href="%s" style="color:#1b7f7b;word-break:break-all;">%s</a>
                  </p>
                </div>

                <div style="background:#f5f7f6;padding:18px 32px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    Automated message from Smart Campus Operations Hub.
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(esc(name), inviteUrl, inviteUrl, inviteUrl);
    }

    private String esc(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}