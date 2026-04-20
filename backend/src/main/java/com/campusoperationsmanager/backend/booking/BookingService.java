package com.campusoperationsmanager.backend.booking;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campusoperationsmanager.backend.auth.repository.UserRepository;
import com.campusoperationsmanager.backend.booking.dto.BookingResponse;
import com.campusoperationsmanager.backend.booking.dto.BookingStatusUpdateRequest;
import com.campusoperationsmanager.backend.booking.dto.CreateBookingRequest;
import com.campusoperationsmanager.backend.notification.model.NotificationType;
import com.campusoperationsmanager.backend.notification.service.NotificationService;
import com.campusoperationsmanager.backend.resource.model.Resource;
import com.campusoperationsmanager.backend.resource.model.ResourceStatus;
import com.campusoperationsmanager.backend.resource.model.ResourceType;
import com.campusoperationsmanager.backend.resource.service.ResourceService;
import com.campusoperationsmanager.backend.timetable.TimetableService;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final TimetableService timetableService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public BookingService(
        BookingRepository bookingRepository,
        ResourceService resourceService,
        TimetableService timetableService,
        NotificationService notificationService,
        UserRepository userRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.resourceService = resourceService;
        this.timetableService = timetableService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
        validateTimeRange(request);

        Resource resource = resourceService.getResourceById(request.getResourceId())
            .orElseThrow(() -> new BookingValidationException("Selected resource does not exist"));

        validateByResourceType(request, resource.getType());

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
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
        booking.setResourceType(resource.getType().name());
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
            Booking saved = bookingRepository.save(booking);
            sendBookingNotification(saved, NotificationType.BOOKING_CANCELLED,
                    "Booking Cancelled",
                    "Your booking for '" + saved.getResourceName() + "' on " + saved.getBookingDate() + " has been cancelled.");
            return BookingResponse.from(saved);
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
            Booking saved = bookingRepository.save(booking);
            sendBookingNotification(saved, NotificationType.BOOKING_APPROVED,
                    "Booking Approved ✓",
                    "Your booking for '" + saved.getResourceName() + "' on " + saved.getBookingDate() + " has been approved.");
            return BookingResponse.from(saved);
        }

        if (nextStatus == BookingStatus.REJECTED) {
            String reason = normalizeText(request.getReviewReason());
            if (reason == null) {
                throw new BookingValidationException("Rejection reason is required");
            }
            booking.setStatus(BookingStatus.REJECTED);
            booking.setReviewReason(reason);
            Booking saved = bookingRepository.save(booking);
            sendBookingNotification(saved, NotificationType.BOOKING_REJECTED,
                    "Booking Rejected",
                    "Your booking for '" + saved.getResourceName() + "' on " + saved.getBookingDate()
                            + " was rejected. Reason: " + reason);
            return BookingResponse.from(saved);
        }

        throw new BookingValidationException("Unsupported status transition");
    }

    private void validateTimeRange(CreateBookingRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BookingValidationException("Start time must be before end time");
        }
    }

    private void validateByResourceType(CreateBookingRequest request, ResourceType resourceType) {
        if (resourceType == ResourceType.EQUIPMENT) {
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

    private void sendBookingNotification(Booking booking, NotificationType type,
                                        String title, String message) {
        try {
            // Look up the user email by userId
            userRepository.findById(booking.getUserId()).ifPresent(user ->
                    notificationService.createTargetedNotification(
                            user.getEmail(), title, message, type, booking.getId())
            );
        } catch (Exception e) {
            // Don't let notification failure break the booking flow
        }
    }
}
