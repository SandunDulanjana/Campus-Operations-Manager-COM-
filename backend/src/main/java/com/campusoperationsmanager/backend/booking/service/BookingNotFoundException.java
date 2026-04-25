package com.campusoperationsmanager.backend.booking.service;

public class BookingNotFoundException extends RuntimeException {
    public BookingNotFoundException(Long id) {
        super("Booking not found: " + id);
    }
}
