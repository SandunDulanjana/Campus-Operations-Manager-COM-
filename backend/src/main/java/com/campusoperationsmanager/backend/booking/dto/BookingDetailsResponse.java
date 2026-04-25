package com.campusoperationsmanager.backend.booking.dto;

import java.util.List;

public class BookingDetailsResponse {

    private BookingResponse booking;
    private List<BookingResponse> history;

    public BookingDetailsResponse(BookingResponse booking, List<BookingResponse> history) {
        this.booking = booking;
        this.history = history;
    }

    public BookingResponse getBooking() {
        return booking;
    }

    public List<BookingResponse> getHistory() {
        return history;
    }
}
