package com.campusoperationsmanager.backend.notification.model;

public enum NotificationType {
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    BOOKING_CANCELLED,
    TICKET_STATUS_CHANGED,
    COMMENT_ADDED,
    ADMIN_BROADCAST,        // manually published by admin
    REGISTRATION_REQUEST    // NEW: new user submitted university ID, waiting for admin approval
}