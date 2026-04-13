package com.campusoperationsmanager.backend.booking;

import com.campusoperationsmanager.backend.booking.dto.BookingResponse;
import com.campusoperationsmanager.backend.booking.dto.BookingStatusUpdateRequest;
import com.campusoperationsmanager.backend.booking.dto.CreateBookingRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_ROLE = "X-User-Role";

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
        @Valid @RequestBody CreateBookingRequest request,
        @RequestHeader(HEADER_USER_ID) Long userId
    ) {
        BookingResponse response = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
        @RequestHeader(HEADER_USER_ID) Long userId
    ) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
        @RequestHeader(HEADER_USER_ROLE) String userRole,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) String resourceType,
        @RequestParam(required = false) BookingStatus status
    ) {
        ensureAdmin(userRole);
        return ResponseEntity.ok(bookingService.getAllBookings(date, resourceType, status));
    }

    @PatchMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> updateBookingStatus(
        @PathVariable Long bookingId,
        @Valid @RequestBody BookingStatusUpdateRequest request,
        @RequestHeader(HEADER_USER_ID) Long userId,
        @RequestHeader(value = HEADER_USER_ROLE, defaultValue = "USER") String userRole
    ) {
        BookingResponse response = bookingService.updateBookingStatus(
            bookingId,
            request,
            userId,
            isAdmin(userRole)
        );
        return ResponseEntity.ok(response);
    }

    private void ensureAdmin(String role) {
        if (!isAdmin(role)) {
            throw new BookingValidationException("Admin role is required for this action");
        }
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }
}
