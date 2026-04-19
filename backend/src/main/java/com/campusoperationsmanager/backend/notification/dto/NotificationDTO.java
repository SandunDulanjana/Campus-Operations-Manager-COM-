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
    private String targetEmail;
    private String targetAudience;
    private boolean published;
    private Long referenceId;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private boolean read;  // computed per user

    public static NotificationDTO from(AppNotification n, boolean read) {
    return NotificationDTO.builder()
            .id(n.getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType())
            .targetEmail(n.getRecipientEmail())        // ← changed
            .targetAudience(n.getTargetRoles())        // ← changed
            .published(n.getRead() != null ? !n.getRead() : true)  // or adjust logic
            .referenceId(n.getReferenceId())
            .createdByEmail(n.getCreatedByEmail())
            .createdAt(n.getCreatedAt())
            .read(read)                                // per-user read status
            .build();
}
}