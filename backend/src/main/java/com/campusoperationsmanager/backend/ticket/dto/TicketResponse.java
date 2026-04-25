package com.campusoperationsmanager.backend.ticket.dto;

import com.campusoperationsmanager.backend.ticket.model.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

// This is what we SEND BACK to the client
// Notice: no fileData here (too large) - client fetches image separately
@Data
@Builder
public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String location;
    private String resourceId;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String createdByEmail;
    private String assignedToEmail;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── SLA fields (Innovation) ───────────────────────────────
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private boolean slaBreached;
    private Long minutesToFirstResponse;  // Calculated: time from created → first response
    private Long minutesToResolution;     // Calculated: time from created → resolved

    // ── Nested objects ────────────────────────────────────────
    private List<CommentResponse> comments;
    private List<AttachmentInfo> attachments;

    // Inner class for comments embedded in ticket response
   @Data
    @Builder
    public static class CommentResponse {
        private Long id;
        private String content;
        private String authorEmail;
        private String authorRole;   
        private String authorName;   
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    // Inner class for attachment metadata (NOT the actual image bytes)
    @Data
    @Builder
    public static class AttachmentInfo {
        private Long id;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private LocalDateTime uploadedAt;
        private String uploadedByEmail;
        // To get actual image: GET /api/v1/tickets/{id}/attachments/{attachmentId}/data
    }
}