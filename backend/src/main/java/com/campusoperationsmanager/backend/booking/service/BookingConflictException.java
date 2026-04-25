package com.campusoperationsmanager.backend.booking.service;

public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
}
