package com.campusoperationsmanager.backend.booking.dto;

import com.campusoperationsmanager.backend.booking.BookingHistory;
import com.campusoperationsmanager.backend.booking.BookingStatus;
import java.time.Instant;

public class BookingHistoryResponse {

    private Long id;
    private Long actorUserId;
    private String actorName;
    private BookingStatus fromStatus;
    private BookingStatus toStatus;
    private String note;
    private Instant createdAt;

    public static BookingHistoryResponse from(BookingHistory history) {
        BookingHistoryResponse response = new BookingHistoryResponse();
        response.id = history.getId();
        response.actorUserId = history.getActorUserId();
        response.actorName = history.getActorName();
        response.fromStatus = history.getFromStatus();
        response.toStatus = history.getToStatus();
        response.note = history.getNote();
        response.createdAt = history.getCreatedAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getActorUserId() {
        return actorUserId;
    }

    public String getActorName() {
        return actorName;
    }

    public BookingStatus getFromStatus() {
        return fromStatus;
    }

    public BookingStatus getToStatus() {
        return toStatus;
    }

    public String getNote() {
        return note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
