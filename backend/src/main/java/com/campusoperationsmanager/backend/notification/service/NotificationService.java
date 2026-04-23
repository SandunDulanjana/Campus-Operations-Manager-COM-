package com.campusoperationsmanager.backend.notification.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.campusoperationsmanager.backend.notification.dto.CreateNotificationRequest;
import com.campusoperationsmanager.backend.notification.dto.NotificationDTO;
import com.campusoperationsmanager.backend.notification.exception.NotificationNotFoundException;
import com.campusoperationsmanager.backend.notification.model.AppNotification;
import com.campusoperationsmanager.backend.notification.model.NotificationRead;
import com.campusoperationsmanager.backend.notification.model.NotificationType;
import com.campusoperationsmanager.backend.notification.repository.NotificationReadRepository;
import com.campusoperationsmanager.backend.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationReadRepository notificationReadRepository;
    // ── NEW: injected for email delivery ─────────────────────────────────────
    private final EmailNotificationService emailNotificationService;

    // ── Admin: Create broadcast notification ─────────────────────────────────
    @Transactional
    public NotificationDTO createBroadcast(CreateNotificationRequest request, String adminEmail) {
        String audience = buildAudienceString(request.getAudienceRoles());

        AppNotification notification = AppNotification.builder()
                .title(request.getTitle().trim())
                .message(request.getMessage().trim())
                .type(NotificationType.ADMIN_BROADCAST)
                .targetAudience(audience)
                .published(request.isPublished())
                .createdByEmail(adminEmail)
                .build();

        AppNotification saved = notificationRepository.save(notification);
        log.info("Admin broadcast created: id={} audience={} by={}", saved.getId(), audience, adminEmail);
        return NotificationDTO.from(saved, false);
    }

    // ── Internal: Create targeted notification (booking / ticket / comment / registration)
    // REQUIRES_NEW so a failure here does NOT roll back the caller's transaction.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createTargetedNotification(String targetEmail,
                                           String title,
                                           String message,
                                           NotificationType type,
                                           Long referenceId) {
        // 1. Save in-app notification (always)
        AppNotification notification = AppNotification.builder()
                .title(title)
                .message(message)
                .type(type)
                .targetEmail(targetEmail)
                .published(true)
                .referenceId(referenceId)
                .createdByEmail("system")
                .build();

        AppNotification saved = notificationRepository.save(notification);
        log.info("Targeted notification saved to DB: id={} to={} type={}", saved.getId(), targetEmail, type);

        // 2. Send email notification
        log.info("Handing off to EmailNotificationService for: {}", targetEmail);
        emailNotificationService.sendNotificationEmail(targetEmail, title, message, type, referenceId);
    }

    // ── User: Get all visible notifications ──────────────────────────────────
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(String email, String role) {
        List<AppNotification> result = new ArrayList<>();

        result.addAll(notificationRepository
                .findByTargetEmailAndPublishedTrueOrderByCreatedAtDesc(email));

        notificationRepository.findAllPublishedBroadcasts().stream()
                .filter(n -> n.isVisibleToRole(role))
                .forEach(result::add);

        result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        Set<Long> readIds = notificationReadRepository.findByUserEmail(email)
                .stream()
                .map(NotificationRead::getNotificationId)
                .collect(Collectors.toSet());

        return result.stream()
                .map(n -> NotificationDTO.from(n, readIds.contains(n.getId())))
                .collect(Collectors.toList());
    }

    // ── User: Count unread ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public long countUnread(String email, String role) {
        return getNotificationsForUser(email, role).stream()
                .filter(n -> !n.isRead())
                .count();
    }

    // ── User: Mark one as read ────────────────────────────────────────────────
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));

        if (!notificationReadRepository.existsByNotificationIdAndUserEmail(notificationId, email)) {
            NotificationRead read = NotificationRead.builder()
                    .notificationId(notificationId)
                    .userEmail(email)
                    .build();
            notificationReadRepository.save(read);
        }
    }

    // ── User: Mark all as read ────────────────────────────────────────────────
    @Transactional
    public void markAllAsRead(String email, String role) {
        List<NotificationDTO> notifications = getNotificationsForUser(email, role);
        for (NotificationDTO dto : notifications) {
            if (!dto.isRead()) {
                markAsRead(dto.getId(), email);
            }
        }
    }

    // ── Admin: Get all notifications ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<NotificationDTO> getAllNotificationsAdmin() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(n -> NotificationDTO.from(n, false))
                .collect(Collectors.toList());
    }

    // ── Admin: Toggle published ───────────────────────────────────────────────
    @Transactional
    public NotificationDTO togglePublished(Long id) {
        AppNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));
        notification.setPublished(!notification.isPublished());
        return NotificationDTO.from(notificationRepository.save(notification), false);
    }

    // ── Admin: Delete notification ────────────────────────────────────────────
    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new NotificationNotFoundException(id);
        }
        notificationRepository.deleteById(id);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private String buildAudienceString(List<String> roles) {
        if (roles == null || roles.isEmpty() || roles.contains("ALL")) {
            return "ALL";
        }
        return roles.stream()
                .map(String::toUpperCase)
                .collect(Collectors.joining(","));
    }
}