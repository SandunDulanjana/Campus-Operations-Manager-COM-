package com.campusoperationsmanager.backend.ticket.dto;

import com.campusoperationsmanager.backend.ticket.model.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {

    @NotNull(message = "New status is required")
    private TicketStatus status;

    // Required ONLY when status = RESOLVED
    private String resolutionNotes;

    // Required ONLY when status = REJECTED (admin only)
    private String rejectionReason;

    // Required ONLY when status = IN_PROGRESS
    private String assignedToEmail;
}