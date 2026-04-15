package com.campusoperationsmanager.backend.ticket.model;

// This defines the allowed values for ticket status
// Stored in DB as text: "OPEN", "IN_PROGRESS" etc. (not numbers)
public enum TicketStatus {
    OPEN,         // Just created, no one working on it yet
    IN_PROGRESS,  // A technician has been assigned and is working
    RESOLVED,     // Technician marked it as fixed
    CLOSED,       // Admin confirmed and closed
    REJECTED      // Admin rejected with a reason
}