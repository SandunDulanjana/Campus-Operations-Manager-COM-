package com.campusoperationsmanager.backend.ticket.model;

public enum TicketPriority {
    LOW,       // Not urgent
    MEDIUM,    // Should be handled soon
    HIGH,      // Urgent
    CRITICAL   // Everything stops until this is fixed
}