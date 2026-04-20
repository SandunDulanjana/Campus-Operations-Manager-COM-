package com.campusoperationsmanager.backend.booking.dto;

import java.util.List;

public class BookingDetailsResponse {

    private BookingResponse booking;
    private List<BookingHistoryResponse> history;

    public BookingDetailsResponse(BookingResponse booking, List<BookingHistoryResponse> history) {
        this.booking = booking;
        this.history = history;
    }

    public BookingResponse getBooking() {
        return booking;
    }

    public List<BookingHistoryResponse> getHistory() {
        return history;
    }
}
