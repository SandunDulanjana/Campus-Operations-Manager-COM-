package com.campusoperationsmanager.backend.ticket.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    // ── Basic info ────────────────────────────────────────────
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    // ── Location & resource ───────────────────────────────────
    @Column(nullable = false)
    private String location;

    private String resourceId; // Optional link to Module A resource

    // ── Contact details ───────────────────────────────────────
    @Column(nullable = false)
    private String contactName;

    private String contactEmail;
    private String contactPhone;

    // ── Ownership & assignment ────────────────────────────────
    @Column(nullable = false)
    private String createdByEmail;   // Who reported this

    private String assignedToEmail;  // Technician assigned

    // ── Resolution / rejection ────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // ── SLA tracking (Innovation feature) ────────────────────
    // firstResponseAt: when ticket status first changed away from OPEN
    private LocalDateTime firstResponseAt;

    // resolvedAt: when status became RESOLVED
    private LocalDateTime resolvedAt;

    // slaBreached: true if exceeded time limits
    @Builder.Default
    private boolean slaBreached = false;

    // ── Timestamps ────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ── Relationships ─────────────────────────────────────────
    // One ticket → many comments
    // cascade = if ticket deleted, delete its comments too
    // orphanRemoval = if comment removed from list, delete from DB
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    // One ticket → up to 3 attachments
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketAttachment> attachments = new ArrayList<>();

    // ── Auto-set timestamps ───────────────────────────────────
    @PrePersist  // Runs automatically before INSERT into DB
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate   // Runs automatically before UPDATE in DB
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
