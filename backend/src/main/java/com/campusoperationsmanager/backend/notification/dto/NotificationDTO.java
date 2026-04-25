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
    private boolean read;

    public static NotificationDTO from(AppNotification n, boolean read) {
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .targetEmail(n.getTargetEmail())
                .targetAudience(n.getTargetAudience())
                .published(Boolean.TRUE.equals(n.getPublished()))  // FIX: Boolean wrapper → getPublished()
                .referenceId(n.getReferenceId())
                .createdByEmail(n.getCreatedByEmail())
                .createdAt(n.getCreatedAt())
                .read(read)
                .build();
    }
}