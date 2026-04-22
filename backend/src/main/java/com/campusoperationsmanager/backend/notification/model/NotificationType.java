package com.campusoperationsmanager.backend.notification.model;

public enum NotificationType {
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    BOOKING_CANCELLED,
    TICKET_STATUS_CHANGED,
    COMMENT_ADDED,
    ADMIN_BROADCAST,            // manually published by admin
    REGISTRATION_REQUEST,       // new user submitted university ID, waiting for admin approval
    REGISTRATION_APPROVED,      // NEW: admin approved the registration
    REGISTRATION_REJECTED       // NEW: admin rejected the registration
}