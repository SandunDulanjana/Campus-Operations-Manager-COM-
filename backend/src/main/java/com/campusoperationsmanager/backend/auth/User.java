package com.campusoperationsmanager.backend.auth;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Google's unique ID — never changes even if user changes email
    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    @Column(name = "profile_picture")
    private String profilePicture;

    // Stored as text: "USER", "ADMIN", "TECHNICIAN"
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // false = banned/deactivated, data kept for audit trail
    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) role = Role.USER; // everyone starts as USER
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Role enum lives here — only auth package needs it
    public enum Role {
        USER,        // student/staff — book rooms, create tickets
        ADMIN,       // approve bookings, manage users
        TECHNICIAN   // handle maintenance tickets
    }
}