package com.campusoperationsmanager.backend.booking;

import com.campusoperationsmanager.backend.booking.dto.BookingResponse;
import com.campusoperationsmanager.backend.booking.dto.BookingDetailsResponse;
import com.campusoperationsmanager.backend.booking.dto.BookingStatusUpdateRequest;
import com.campusoperationsmanager.backend.booking.dto.CreateBookingRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
        @Valid @RequestBody CreateBookingRequest request,
        @AuthenticationPrincipal Long userId
    ) {
        BookingResponse response = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
        @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingDetailsResponse> getBookingDetails(
        @PathVariable Long bookingId,
        @AuthenticationPrincipal Long userId,
        Authentication authentication
    ) {
        return ResponseEntity.ok(bookingService.getBookingDetails(bookingId, userId, isAdmin(authentication)));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) String resourceType,
        @RequestParam(required = false) BookingStatus status
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(date, resourceType, status));
    }

    @GetMapping("/approved-weekly")
    public ResponseEntity<List<BookingResponse>> getApprovedBookingsForWeek(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart
    ) {
        return ResponseEntity.ok(bookingService.getApprovedBookingsForWeek(weekStart));
    }

    @PatchMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> updateBookingStatus(
        @PathVariable Long bookingId,
        @Valid @RequestBody BookingStatusUpdateRequest request,
        @AuthenticationPrincipal Long userId,
        Authentication authentication
    ) {
        BookingResponse response = bookingService.updateBookingStatus(
            bookingId,
            request,
            userId,
            isAdmin(authentication)
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/resubmit")
    public ResponseEntity<BookingResponse> resubmitBooking(
        @PathVariable Long bookingId,
        @Valid @RequestBody CreateBookingRequest request,
        @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(bookingService.resubmitBooking(bookingId, request, userId));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
            && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
