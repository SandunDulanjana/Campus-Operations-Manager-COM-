package com.campusoperationsmanager.backend.booking.dto;

import com.campusoperationsmanager.backend.booking.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BookingStatusUpdateRequest {

    @NotNull
    private BookingStatus status;

    @Size(max = 500)
    private String reviewReason;

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getReviewReason() {
        return reviewReason;
    }

    public void setReviewReason(String reviewReason) {
        this.reviewReason = reviewReason;
    }
}
