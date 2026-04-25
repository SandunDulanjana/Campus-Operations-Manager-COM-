package com.campusoperationsmanager.backend.booking.service;

public class BookingValidationException extends RuntimeException {
    public BookingValidationException(String message) {
        super(message);
    }
}
