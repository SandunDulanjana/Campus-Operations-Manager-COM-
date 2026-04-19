package com.campusoperationsmanager.backend.notification.controller;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;
import com.campusoperationsmanager.backend.notification.dto.CreateNotificationRequest;
import com.campusoperationsmanager.backend.notification.dto.NotificationDTO;
import com.campusoperationsmanager.backend.notification.exception.NotificationNotFoundException;
import com.campusoperationsmanager.backend.notification.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    // ── GET /api/notifications ── my notifications ─────────────────────────
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        List<NotificationDTO> notifications = notificationService
                .getNotificationsForUser(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(notifications);
    }

    // ── GET /api/notifications/unread-count ──────────────────────────────────
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        long count = notificationService.countUnread(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ── PATCH /api/notifications/{id}/read ───────────────────────────────────
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        notificationService.markAsRead(id, user.getEmail());
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    // ── PATCH /api/notifications/read-all ────────────────────────────────────
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        notificationService.markAllAsRead(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }

    // ── ADMIN: POST /api/notifications (create broadcast) ───────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createBroadcast(
            @Valid @RequestBody CreateNotificationRequest request,
            Authentication authentication) {

        try {
            Long userId = null;

            if (authentication != null && authentication.getPrincipal() != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof Long) {
                    userId = (Long) principal;
                } else if (principal instanceof String) {
                    try {
                        userId = Long.parseLong((String) principal);
                    } catch (NumberFormatException e) {
                        log.warn("Principal is a String but not a valid Long: {}", principal);
                    }
                } else {
                    log.warn("Unknown principal type: {}", principal.getClass().getName());
                }
                log.debug("Extracted admin userId: {} from principal type: {}", userId, principal.getClass().getSimpleName());
            }

            if (userId == null) {
                String type = (authentication != null && authentication.getPrincipal() != null) 
                              ? authentication.getPrincipal().getClass().getName() : "null";
                throw new IllegalStateException("Could not extract admin user ID. Principal type: " + type);
            }

            User user = requireUser(userId);
            NotificationDTO dto = notificationService.createBroadcast(request, user.getEmail(), userId);

            log.info("Broadcast notification created successfully by admin: {} (ID: {})", 
                     user.getEmail(), userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);

        } catch (Exception e) {
            log.error("Failed to create broadcast notification: {}", e.getMessage(), e);
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal Server Error",
                            "message", e.getMessage() != null ? e.getMessage() : "Unknown error",
                            "trace", sw.toString()
                    ));
        }
    }

    // ── ADMIN: GET /api/notifications/admin/all ───────────────────────────────
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getAllNotificationsAdmin() {
        return ResponseEntity.ok(notificationService.getAllNotificationsAdmin());
    }

    // ── ADMIN: PATCH /api/notifications/{id}/toggle-published ────────────────
    @PatchMapping("/{id}/toggle-published")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDTO> togglePublished(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.togglePublished(id));
    }

    // ── ADMIN: DELETE /api/notifications/{id} ────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private User requireUser(Long userId) {
        if (userId == null) {
            throw new IllegalStateException("Authenticated user id is missing - check JWT setup");
        }
        return userService.getUserById(userId);
    }

    // ── Exception handler ─────────────────────────────────────────────────────
    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NotificationNotFoundException ex) {
        return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        log.error("Unhandled exception in NotificationController: {}", ex.getMessage(), ex);
        return ResponseEntity.status(500).body(Map.of(
                "error", "Internal Server Error",
                "message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred"
        ));
    }
}