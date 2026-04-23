package com.campusoperationsmanager.backend.notification.service;

import com.campusoperationsmanager.backend.notification.model.NotificationType;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${MAIL_USERNAME:}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ── Targeted notification email (booking, ticket, comment, registration) ──
    public void sendNotificationEmail(String toEmail,
                                      String title,
                                      String message,
                                      NotificationType type,
                                      Long referenceId) {
        try {
            if (fromAddress == null || fromAddress.isBlank()) {
                log.error("CRITICAL: EMAIL_USERNAME is not configured in .env. Email cannot be sent.");
                return;
            }

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            log.info("Preparing to send notification email. AuthUser/From: {}, To: {}", fromAddress, toEmail);

            helper.setFrom(fromAddress, "Smart Campus Operations Hub");
            helper.setTo(toEmail);
            helper.setSubject(buildSubject(type, title));
            helper.setText(buildNotificationHtml(title, message, type, referenceId), true);
            
            mailSender.send(mime);
            log.info("Email notification SENT SUCCESS: type={} to={}", type, toEmail);
        } catch (Exception e) {
            log.error("CRITICAL: Email notification failed for recipient {}. AuthUser: {}. Error: {}", toEmail, fromAddress, e.getMessage(), e);
        }
    }

    // ── Invite email ──────────────────────────────────────────────────────────
    public void sendInviteEmail(String toEmail, String toName, String inviteUrl) {
        try {
            if (fromAddress == null || fromAddress.isBlank()) {
                log.error("CRITICAL: EMAIL_USERNAME is not configured in .env. Email cannot be sent.");
                return;
            }

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            log.info("Preparing to send invite email. AuthUser/From: {}, To: {}", fromAddress, toEmail);

            helper.setFrom(fromAddress, "Smart Campus Hub");
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Smart Campus - Account Setup");
            helper.setText(buildInviteHtml(toName, inviteUrl), true);
            
            mailSender.send(mime);
            log.info("Invite email SENT SUCCESS to: {}", toEmail);
        } catch (Exception e) {
            log.error("CRITICAL: Invite email failed for {}. AuthUser: {}. Error: {}", toEmail, fromAddress, e.getMessage(), e);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

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