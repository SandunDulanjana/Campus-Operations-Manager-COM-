package com.campusoperationsmanager.backend.notification.dto;

import java.time.LocalDateTime;

import com.campusoperationsmanager.backend.notification.model.AppNotification;
import com.campusoperationsmanager.backend.notification.model.NotificationType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private String targetEmail;       // ← matches AppNotification.targetEmail
    private String targetAudience;    // ← matches AppNotification.targetAudience
    private boolean published;
    private Long referenceId;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private boolean read;             // ← computed per user, passed as parameter — NOT from AppNotification

    public static NotificationDTO from(AppNotification n, boolean read) {
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .targetEmail(n.getTargetEmail())        // ← FIXED: was n.getRecipientEmail()
                .targetAudience(n.getTargetAudience())  // ← FIXED: was n.getTargetRoles()
                .published(n.isPublished())
                .referenceId(n.getReferenceId())
                .createdByEmail(n.getCreatedByEmail())
                .createdAt(n.getCreatedAt())
                .read(read)                             // ← FIXED: was n.getRead() — read comes from the parameter
                .build();
    }
}