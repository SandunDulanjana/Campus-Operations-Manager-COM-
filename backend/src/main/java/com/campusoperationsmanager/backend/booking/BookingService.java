package com.campusoperationsmanager.backend.booking;

import com.campusoperationsmanager.backend.booking.dto.BookingResponse;
import com.campusoperationsmanager.backend.booking.dto.BookingStatusUpdateRequest;
import com.campusoperationsmanager.backend.booking.dto.CreateBookingRequest;
import com.campusoperationsmanager.backend.booking.resource.ResourceCatalog;
import com.campusoperationsmanager.backend.booking.resource.ResourceCatalogService;
import com.campusoperationsmanager.backend.timetable.TimetableService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceCatalogService resourceCatalogService;
    private final TimetableService timetableService;

    public BookingService(BookingRepository bookingRepository, ResourceCatalogService resourceCatalogService,
                         TimetableService timetableService) {
        this.bookingRepository = bookingRepository;
        this.resourceCatalogService = resourceCatalogService;
        this.timetableService = timetableService;
    }

    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
        validateTimeRange(request);

        ResourceCatalog resource = resourceCatalogService.findById(request.getResourceId())
            .orElseThrow(() -> new BookingValidationException("Selected resource does not exist"));

        validateByResourceType(request, resource.getType());

        if (!resource.isActive()) {
            throw new BookingValidationException("Selected resource is OUT_OF_SERVICE");
        }

        boolean hasConflict = bookingRepository.hasApprovedOverlap(
            request.getResourceId(),
            request.getBookingDate(),
            request.getStartTime(),
            request.getEndTime()
        );

        if (hasConflict) {
            throw new BookingConflictException("Requested time range overlaps an approved booking");
        }

        boolean hasTimetableConflict = timetableService.hasConflict(
            request.getResourceId(),
            request.getBookingDate(),
            request.getStartTime(),
            request.getEndTime()
        );

        if (hasTimetableConflict) {
            throw new BookingConflictException("Requested time range overlaps faculty timetable");
        }

        if (request.getExpectedAttendees() != null && resource.getCapacity() != null
            && request.getExpectedAttendees() > resource.getCapacity()) {
            throw new BookingValidationException("Expected attendees exceed resource capacity");
        }

        Booking booking = new Booking();
        booking.setResourceId(resource.getId());
        booking.setResourceName(resource.getName());
        booking.setResourceType(resource.getType());
        booking.setUserId(userId);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setEquipmentType(normalizeText(request.getEquipmentType()));
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(BookingResponse::from)
            .toList();
    }

    public List<BookingResponse> getAllBookings(LocalDate date, String resourceType, BookingStatus status) {
        return bookingRepository.findAllWithFilters(date, normalizeText(resourceType), status)
            .stream()
            .map(BookingResponse::from)
            .toList();
    }

    public List<BookingResponse> getApprovedBookingsForWeek(LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        return bookingRepository.findByStatusAndBookingDateBetweenOrderByBookingDateAscStartTimeAsc(
                BookingStatus.APPROVED,
                weekStart,
                weekEnd
            )
            .stream()
            .map(BookingResponse::from)
            .toList();
    }

    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request, Long actorUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new BookingNotFoundException(bookingId));
        BookingStatus nextStatus = request.getStatus();

        if (nextStatus == BookingStatus.CANCELLED) {
            if (!booking.getUserId().equals(actorUserId) && !isAdmin) {
                throw new BookingValidationException("You can only cancel your own booking");
            }
            if (booking.getStatus() != BookingStatus.APPROVED) {
                throw new BookingValidationException("Only APPROVED bookings can be cancelled");
            }
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setReviewReason(normalizeText(request.getReviewReason()));
            return BookingResponse.from(bookingRepository.save(booking));
        }

        if (!isAdmin) {
            throw new BookingValidationException("Only admins can approve or reject bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingValidationException("Only PENDING bookings can be reviewed");
        }

        if (nextStatus == BookingStatus.APPROVED) {
            boolean hasConflict = bookingRepository.hasApprovedOverlap(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
            );
            if (hasConflict) {
                throw new BookingConflictException("Cannot approve. Booking conflicts with another approved booking");
            }
            booking.setStatus(BookingStatus.APPROVED);
            booking.setReviewReason(normalizeText(request.getReviewReason()));
            return BookingResponse.from(bookingRepository.save(booking));
        }

        if (nextStatus == BookingStatus.REJECTED) {
            String reason = normalizeText(request.getReviewReason());
            if (reason == null) {
                throw new BookingValidationException("Rejection reason is required");
            }
            booking.setStatus(BookingStatus.REJECTED);
            booking.setReviewReason(reason);
            return BookingResponse.from(bookingRepository.save(booking));
        }

        throw new BookingValidationException("Unsupported status transition");
    }

    private void validateTimeRange(CreateBookingRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BookingValidationException("Start time must be before end time");
        }
    }

    private void validateByResourceType(CreateBookingRequest request, String resourceType) {
        String type = normalizeText(resourceType);
        if (type == null) {
            type = "";
        }

        if ("EQUIPMENT".equalsIgnoreCase(type)) {
            if (normalizeText(request.getEquipmentType()) == null) {
                throw new BookingValidationException("Equipment type is required for EQUIPMENT bookings");
            }
            if (request.getExpectedAttendees() != null) {
                throw new BookingValidationException("Expected attendees must be empty for EQUIPMENT bookings");
            }
        } else {
            if (request.getExpectedAttendees() == null || request.getExpectedAttendees() <= 0) {
                throw new BookingValidationException("Expected attendees must be a positive number");
            }
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
