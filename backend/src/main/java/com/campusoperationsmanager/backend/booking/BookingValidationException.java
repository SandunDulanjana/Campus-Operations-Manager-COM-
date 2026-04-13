package com.campusoperationsmanager.backend.booking;

public class BookingValidationException extends RuntimeException {
    public BookingValidationException(String message) {
        super(message);
    }
}
