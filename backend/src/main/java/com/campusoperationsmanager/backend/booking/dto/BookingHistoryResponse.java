package com.campusoperationsmanager.backend.booking.dto;

import com.campusoperationsmanager.backend.booking.BookingHistory;
import com.campusoperationsmanager.backend.booking.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingHistoryResponse {

    private Long id;
    private Long actorUserId;
    private String actorName;
    private BookingStatus fromStatus;
    private BookingStatus toStatus;
    private String note;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String equipmentType;
    private Instant createdAt;

    public static BookingHistoryResponse from(BookingHistory history) {
        BookingHistoryResponse response = new BookingHistoryResponse();
        response.id = history.getId();
        response.actorUserId = history.getActorUserId();
        response.actorName = history.getActorName();
        response.fromStatus = history.getFromStatus();
        response.toStatus = history.getToStatus();
        response.note = history.getNote();
        response.bookingDate = history.getBookingDate();
        response.startTime = history.getStartTime();
        response.endTime = history.getEndTime();
        response.purpose = history.getPurpose();
        response.expectedAttendees = history.getExpectedAttendees();
        response.equipmentType = history.getEquipmentType();
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

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public String getEquipmentType() {
        return equipmentType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
