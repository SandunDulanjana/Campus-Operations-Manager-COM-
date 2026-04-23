package com.campusoperationsmanager.backend.notification.model;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // null = broadcast (audience-based), non-null = targeted to one user by email
    @Column(name = "target_email")
    private String targetEmail;

    // For broadcast notifications: which roles can see it
    // Stored as comma-separated: "USER,ADMIN,TECHNICIAN" or "ALL"
    @Column(name = "target_audience")
    private String targetAudience;

    @Column(name = "published", nullable = false)
    @Builder.Default
    private Boolean published = true;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by_email")
    private String createdByEmail;

    // ── FIX 1: was missing — DB has read BOOLEAN NOT NULL ────────────────────
    @Column(name = "read", nullable = false)
    @Builder.Default
    private Boolean read = false;

    // ── FIX 2: was missing — DB has recipient_user_id BIGINT (nullable after migration)
    @Column(name = "recipient_user_id")
    private Long recipientUserId;

    // ── FIX 3: was missing — DB has updated_at TIMESTAMP NOT NULL ────────────
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now(); // ← FIX 3: set on insert
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // ← FIX 3: set on update
    }

    // Helper: check if a given role is in the target audience
    public boolean isVisibleToRole(String role) {
        if (targetAudience == null) return false;
        if ("ALL".equalsIgnoreCase(targetAudience)) return true;
        for (String r : targetAudience.split(",")) {
            if (r.trim().equalsIgnoreCase(role)) return true;
        }
        return false;
    }
}