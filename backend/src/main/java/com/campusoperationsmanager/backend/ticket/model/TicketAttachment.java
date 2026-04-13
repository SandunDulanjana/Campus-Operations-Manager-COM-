package com.campusoperationsmanager.backend.ticket.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_attachments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @ToString.Exclude
    private Ticket ticket;

    private String fileName;    // e.g. "broken_projector.jpg"
    private String fileType;    // e.g. "image/jpeg"

    // We store the image as Base64 text in the DB
    // This avoids needing a separate file storage service
    @Column(columnDefinition = "TEXT")
    private String fileData;

    private Long fileSize;          // Size in bytes
    private String uploadedByEmail;

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
