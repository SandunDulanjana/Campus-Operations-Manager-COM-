package com.campusoperationsmanager.backend.notification.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
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

    // ═══════════════════════════════════════════════
    // ADMIN: Create broadcast notification
    // ═══════════════════════════════════════════════
    @Transactional
    public NotificationDTO createBroadcast(CreateNotificationRequest request, String adminEmail, Long adminUserId) {
        log.info("Creating broadcast notification: title='{}', by='{}' (userId={})", 
                 request.getTitle(), adminEmail, adminUserId);

        String audience = buildAudienceString(request.getAudienceRoles());

        AppNotification notification = AppNotification.builder()
                .title(request.getTitle().trim())
                .message(request.getMessage().trim())
                .type(NotificationType.ADMIN_BROADCAST)
                .targetRoles(audience)
                .recipientUserId(adminUserId != null ? adminUserId : 0L)
                .read(false)
                .createdByEmail(adminEmail)
                .build();

        try {
            AppNotification saved = notificationRepository.save(notification);
            log.info("Broadcast created successfully: id={}", saved.getId());
            return NotificationDTO.from(saved, false);
        } catch (Exception e) {
            log.error("Failed to save broadcast notification", e);
            throw new RuntimeException("Failed to save notification: " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════
    // INTERNAL: Create targeted notification
    // ═══════════════════════════════════════════════
    @Transactional
    public void createTargetedNotification(String targetEmail,
                                           String title,
                                           String message,
                                           NotificationType type,
                                           Long referenceId) {

        Long recipientUserId = 0L;

        AppNotification notification = AppNotification.builder()
                .title(title)
                .message(message)
                .type(type)
                .recipientEmail(targetEmail)
                .recipientUserId(recipientUserId)
                .read(false)
                .referenceId(referenceId)
                .createdByEmail("system")
                .build();

        notificationRepository.save(notification);
        log.info("Targeted notification created: type={} to={} ref={}", type, targetEmail, referenceId);
    }

    // ═══════════════════════════════════════════════
    // USER: Get all visible notifications for a user
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(String email, String role) {
        List<AppNotification> result = new ArrayList<>();

        // 1. Targeted notifications for this user
        result.addAll(notificationRepository.findAll().stream()
                .filter(n -> email.equals(n.getRecipientEmail()))
                .toList());

        // 2. Broadcast notifications visible to this role
        notificationRepository.findAll().stream()
                .filter(n -> n.getRecipientEmail() == null && n.isVisibleToRole(role))
                .forEach(result::add);

        // Sort by createdAt desc
        result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        // Get read IDs for this user
        Set<Long> readIds = notificationReadRepository.findByUserEmail(email)
                .stream()
                .map(NotificationRead::getNotificationId)
                .collect(Collectors.toSet());

        return result.stream()
                .map(n -> NotificationDTO.from(n, readIds.contains(n.getId())))
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════
    // USER: Count unread notifications
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public long countUnread(String email, String role) {
        return getNotificationsForUser(email, role).stream()
                .filter(n -> !n.isRead())          // ← Fixed: use isRead() for boolean
                .count();
    }

    // ═══════════════════════════════════════════════
    // USER: Mark a notification as read
    // ═══════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════
    // USER: Mark ALL notifications as read
    // ═══════════════════════════════════════════════
    @Transactional
    public void markAllAsRead(String email, String role) {
        List<NotificationDTO> notifications = getNotificationsForUser(email, role);
        for (NotificationDTO dto : notifications) {
            if (!dto.isRead()) {
                markAsRead(dto.getId(), email);
            }
        }
    }

    // ═══════════════════════════════════════════════
    // ADMIN: Get all notifications
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<NotificationDTO> getAllNotificationsAdmin() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(n -> NotificationDTO.from(n, false))
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════
    // ADMIN: Toggle visibility (using 'read' flag)
    // ═══════════════════════════════════════════════
    @Transactional
    public NotificationDTO togglePublished(Long id) {
        AppNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        notification.setRead(!Boolean.TRUE.equals(notification.getRead()));

        AppNotification saved = notificationRepository.save(notification);
        return NotificationDTO.from(saved, false);
    }

    // ═══════════════════════════════════════════════
    // ADMIN: Delete a notification
    // ═══════════════════════════════════════════════
    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new NotificationNotFoundException(id);
        }
        notificationRepository.deleteById(id);
    }

    // ═══════════════════════════════════════════════
    // HELPER
    // ═══════════════════════════════════════════════
    private String buildAudienceString(List<String> roles) {
        if (roles == null || roles.isEmpty() || roles.contains("ALL")) {
            return "ALL";
        }
        return roles.stream()
                .map(String::toUpperCase)
                .collect(Collectors.joining(","));
    }
}