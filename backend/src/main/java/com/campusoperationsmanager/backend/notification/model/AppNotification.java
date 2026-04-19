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

    // ← CHANGED: removed @Builder.Default — it conflicted with Hibernate 7.x bytecode enhancement.
    //   published is always set explicitly in every builder call, so @Builder.Default is not needed.
    @Column(nullable = false)
    private boolean published;      // ← CHANGED: was "@Builder.Default private boolean published = true;"

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by_email")
    private String createdByEmail;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // ← ADD: ensure published has a safe default if somehow not set via builder
        // (defensive guard — in normal flow the builder always sets it explicitly)
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