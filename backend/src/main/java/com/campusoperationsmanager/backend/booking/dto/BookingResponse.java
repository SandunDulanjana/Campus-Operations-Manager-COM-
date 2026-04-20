package com.campusoperationsmanager.backend.booking.dto;

import com.campusoperationsmanager.backend.booking.Booking;
import com.campusoperationsmanager.backend.booking.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingResponse {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private Long userId;
    private String userName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String equipmentType;
    private BookingStatus status;
    private String reviewReason;
    private Instant createdAt;
    private Instant updatedAt;

    public static BookingResponse from(Booking booking, String userName) {
        BookingResponse response = new BookingResponse();
        response.id = booking.getId();
        response.resourceId = booking.getResourceId();
        response.resourceName = booking.getResourceName();
        response.resourceType = booking.getResourceType();
        response.userId = booking.getUserId();
        response.userName = userName;
        response.bookingDate = booking.getBookingDate();
        response.startTime = booking.getStartTime();
        response.endTime = booking.getEndTime();
        response.purpose = booking.getPurpose();
        response.expectedAttendees = booking.getExpectedAttendees();
        response.equipmentType = booking.getEquipmentType();
        response.status = booking.getStatus();
        response.reviewReason = booking.getReviewReason();
        response.createdAt = booking.getCreatedAt();
        response.updatedAt = booking.getUpdatedAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getResourceType() {
        return resourceType;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
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

    public BookingStatus getStatus() {
        return status;
    }

    public String getReviewReason() {
        return reviewReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
