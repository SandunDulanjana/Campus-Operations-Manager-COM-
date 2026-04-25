package com.campusoperationsmanager.backend.booking.service;

import com.campusoperationsmanager.backend.booking.model.Booking;
import com.campusoperationsmanager.backend.booking.model.BookingHistory;
import com.campusoperationsmanager.backend.booking.model.BookingStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.repository.UserRepository;
import com.campusoperationsmanager.backend.booking.dto.BookingDetailsResponse;
import com.campusoperationsmanager.backend.booking.dto.BookingResponse;
import com.campusoperationsmanager.backend.booking.dto.BookingStatusUpdateRequest;
import com.campusoperationsmanager.backend.booking.dto.CreateBookingRequest;
import com.campusoperationsmanager.backend.booking.repository.BookingHistoryRepository;
import com.campusoperationsmanager.backend.booking.repository.BookingRepository;
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
    private final BookingHistoryRepository bookingHistoryRepository;
    private final UserRepository userRepository;
    private final ResourceService resourceService;
    private final TimetableService timetableService;
    private final NotificationService notificationService;

    public BookingService(
        BookingRepository bookingRepository,
        BookingHistoryRepository bookingHistoryRepository,
        UserRepository userRepository,
        ResourceService resourceService,
        TimetableService timetableService,
        NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingHistoryRepository = bookingHistoryRepository;
        this.userRepository = userRepository;
        this.resourceService = resourceService;
        this.timetableService = timetableService;
        this.notificationService = notificationService;
    }

    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
        validateTimeRange(request);

        Resource resource = resourceService.getResourceById(request.getResourceId())
            .orElseThrow(() -> new BookingValidationException("Selected resource does not exist"));

        validateByResourceType(request, resource.getType());

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BookingValidationException("Selected resource is OUT_OF_SERVICE");
        }

        validateConflicts(request, resource, null);

        Booking booking = new Booking();
        booking.setResourceId(resource.getId());
        booking.setResourceName(resource.getName());
        booking.setResourceType(resource.getType().name());
        booking.setUserId(userId);
        booking.setPreviousBookingId(null);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setEquipmentType(normalizeText(request.getEquipmentType()));
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        recordHistory(saved.getId(), userId, null, BookingStatus.PENDING, "Booking request created", saved);
        return toResponse(saved, resolveUserNames(Set.of(saved.getUserId())));
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        List<Booking> allBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Booking> latestOnly = keepLatestVersions(allBookings);
        return toResponses(latestOnly);
    }

    public List<BookingResponse> getAllBookings(LocalDate date, String resourceType, BookingStatus status) {
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> latestOnly = keepLatestVersions(allBookings);

        String normalizedResourceType = normalizeText(resourceType);

        List<Booking> filtered = latestOnly.stream()
            .filter(booking -> date == null || booking.getBookingDate().equals(date))
            .filter(booking -> normalizedResourceType == null || normalizedResourceType.equals(booking.getResourceType()))
            .filter(booking -> status == null || booking.getStatus() == status)
            .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
            .toList();

        return toResponses(filtered);
    }

    public List<BookingResponse> getApprovedBookingsForWeek(LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<Booking> bookings = bookingRepository.findByStatusAndBookingDateBetweenOrderByBookingDateAscStartTimeAsc(
            BookingStatus.APPROVED,
            weekStart,
            weekEnd
        );
        return toResponses(bookings);
    }

    public BookingDetailsResponse getBookingDetails(Long bookingId, Long actorUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (!isAdmin && !Objects.equals(booking.getUserId(), actorUserId)) {
            throw new BookingValidationException("You can only view your own booking details");
        }

        List<Booking> versionChain = getVersionChain(booking);

        Set<Long> userIds = versionChain.stream().map(Booking::getUserId).collect(Collectors.toSet());
        Map<Long, String> userNames = resolveUserNames(userIds);

        List<BookingResponse> history = versionChain.stream()
            .filter(version -> !Objects.equals(version.getId(), booking.getId()))
            .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
            .map(version -> toResponse(version, userNames))
            .toList();

        return new BookingDetailsResponse(toResponse(booking, userNames), history);
    }

    public BookingResponse resubmitBooking(Long bookingId, CreateBookingRequest request, Long actorUserId) {
        Booking previousBooking = bookingRepository.findById(bookingId).orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (!Objects.equals(previousBooking.getUserId(), actorUserId)) {
            throw new BookingValidationException("You can only resubmit your own booking");
        }

        if (previousBooking.getStatus() != BookingStatus.REJECTED) {
            throw new BookingValidationException("Only REJECTED bookings can be resubmitted");
        }

        validateTimeRange(request);

        Resource resource = resourceService.getResourceById(request.getResourceId())
            .orElseThrow(() -> new BookingValidationException("Selected resource does not exist"));

        validateByResourceType(request, resource.getType());

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BookingValidationException("Selected resource is OUT_OF_SERVICE");
        }

        validateConflicts(request, resource, null);

        Booking newVersion = new Booking();
        newVersion.setResourceId(resource.getId());
        newVersion.setResourceName(resource.getName());
        newVersion.setResourceType(resource.getType().name());
        newVersion.setUserId(actorUserId);
        newVersion.setPreviousBookingId(previousBooking.getId());
        newVersion.setBookingDate(request.getBookingDate());
        newVersion.setStartTime(request.getStartTime());
        newVersion.setEndTime(request.getEndTime());
        newVersion.setPurpose(request.getPurpose().trim());
        newVersion.setExpectedAttendees(request.getExpectedAttendees());
        newVersion.setEquipmentType(normalizeText(request.getEquipmentType()));
        newVersion.setStatus(BookingStatus.PENDING);
        newVersion.setReviewReason(null);

        Booking saved = bookingRepository.save(newVersion);
        recordHistory(saved.getId(), actorUserId, BookingStatus.REJECTED, BookingStatus.PENDING, "Booking request resubmitted", saved);
        return toResponse(saved, resolveUserNames(Set.of(saved.getUserId())));
    }

    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request, Long actorUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new BookingNotFoundException(bookingId));
        BookingStatus nextStatus = request.getStatus();

        if (nextStatus == BookingStatus.CANCELLED) {
            if (!Objects.equals(booking.getUserId(), actorUserId) && !isAdmin) {
                throw new BookingValidationException("You can only cancel your own booking");
            }
            if (booking.getStatus() != BookingStatus.APPROVED) {
                throw new BookingValidationException("Only APPROVED bookings can be cancelled");
            }
            BookingStatus previousStatus = booking.getStatus();
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setReviewReason(normalizeText(request.getReviewReason()));
            Booking saved = bookingRepository.save(booking);
            sendBookingNotification(
                saved,
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking for '" + saved.getResourceName() + "' on " + saved.getBookingDate() + " has been cancelled."
            );
            recordHistory(saved.getId(), actorUserId, previousStatus, BookingStatus.CANCELLED, booking.getReviewReason(), saved);
            return toResponse(saved, resolveUserNames(Set.of(saved.getUserId())));
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
            BookingStatus previousStatus = booking.getStatus();
            booking.setStatus(BookingStatus.APPROVED);
            booking.setReviewReason(normalizeText(request.getReviewReason()));
            Booking saved = bookingRepository.save(booking);
            sendBookingNotification(
                saved,
                NotificationType.BOOKING_APPROVED,
                "Booking Approved ✓",
                "Your booking for '" + saved.getResourceName() + "' on " + saved.getBookingDate() + " has been approved."
            );
            recordHistory(saved.getId(), actorUserId, previousStatus, BookingStatus.APPROVED, booking.getReviewReason(), saved);
            return toResponse(saved, resolveUserNames(Set.of(saved.getUserId())));
        }

        if (nextStatus == BookingStatus.REJECTED) {
            String reason = normalizeText(request.getReviewReason());
            if (reason == null) {
                throw new BookingValidationException("Rejection reason is required");
            }
            BookingStatus previousStatus = booking.getStatus();
            booking.setStatus(BookingStatus.REJECTED);
            booking.setReviewReason(reason);
            Booking saved = bookingRepository.save(booking);
            sendBookingNotification(
                saved,
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for '" + saved.getResourceName() + "' on " + saved.getBookingDate()
                    + " was rejected. Reason: " + reason
            );
            recordHistory(saved.getId(), actorUserId, previousStatus, BookingStatus.REJECTED, reason, saved);
            return toResponse(saved, resolveUserNames(Set.of(saved.getUserId())));
        }

        throw new BookingValidationException("Unsupported status transition");
    }

    @Transactional
    public void deleteBooking(Long bookingId, Long actorUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (!isAdmin && !Objects.equals(booking.getUserId(), actorUserId)) {
            throw new BookingValidationException("You can only delete your own booking");
        }

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new BookingValidationException("Cancel APPROVED bookings instead of deleting them");
        }

        if (bookingRepository.existsByPreviousBookingId(bookingId)) {
            throw new BookingValidationException("Cannot delete a booking that has resubmitted versions");
        }

        bookingHistoryRepository.deleteByBookingId(bookingId);
        bookingRepository.delete(booking);
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

    private void validateConflicts(CreateBookingRequest request, Resource resource, Long excludeBookingId) {
        boolean hasConflict = bookingRepository.findApprovedOverlaps(
            request.getResourceId(),
            request.getBookingDate(),
            request.getStartTime(),
            request.getEndTime()
        ).stream().anyMatch(existing -> excludeBookingId == null || !existing.getId().equals(excludeBookingId));

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
    }

    private List<Booking> keepLatestVersions(List<Booking> bookings) {
        Set<Long> parentIds = bookings.stream()
            .map(Booking::getPreviousBookingId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        return bookings.stream()
            .filter(booking -> !parentIds.contains(booking.getId()))
            .collect(Collectors.toList());
    }

    private List<Booking> getVersionChain(Booking booking) {
        List<Booking> versions = new ArrayList<>();
        Booking cursor = booking;
        versions.add(cursor);

        while (cursor.getPreviousBookingId() != null) {
            cursor = bookingRepository.findById(cursor.getPreviousBookingId())
                .orElseThrow(() -> new BookingValidationException("Booking history is incomplete"));
            versions.add(cursor);
        }

        return versions;
    }

    private List<BookingResponse> toResponses(List<Booking> bookings) {
        Map<Long, String> userNames = resolveUserNames(
            bookings.stream().map(Booking::getUserId).collect(Collectors.toSet())
        );

        return bookings.stream().map(booking -> toResponse(booking, userNames)).toList();
    }

    private BookingResponse toResponse(Booking booking, Map<Long, String> userNames) {
        return BookingResponse.from(booking, userNames.getOrDefault(booking.getUserId(), "Unknown User"));
    }

    private Map<Long, String> resolveUserNames(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, this::displayNameFor));
    }

    private String displayNameFor(User user) {
        String name = normalizeText(user.getName());
        if (name != null) {
            return name;
        }
        String username = normalizeText(user.getUsername());
        if (username != null) {
            return username;
        }
        return user.getEmail();
    }

    private void recordHistory(Long bookingId, Long actorUserId, BookingStatus fromStatus, BookingStatus toStatus, String note, Booking bookingSnapshot) {
        BookingHistory history = new BookingHistory();
        history.setBookingId(bookingId);
        history.setActorUserId(actorUserId);
        history.setActorName(resolveActorName(actorUserId));
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setNote(normalizeText(note));

        if (bookingSnapshot != null) {
            history.setBookingDate(bookingSnapshot.getBookingDate());
            history.setStartTime(bookingSnapshot.getStartTime());
            history.setEndTime(bookingSnapshot.getEndTime());
            history.setPurpose(bookingSnapshot.getPurpose());
            history.setExpectedAttendees(bookingSnapshot.getExpectedAttendees());
            history.setEquipmentType(bookingSnapshot.getEquipmentType());
        }

        bookingHistoryRepository.save(history);
    }

    private String resolveActorName(Long actorUserId) {
        return userRepository.findById(actorUserId).map(this::displayNameFor).orElse("System");
    }

    private void sendBookingNotification(Booking booking, NotificationType type, String title, String message) {
        try {
            userRepository.findById(booking.getUserId()).ifPresent(user ->
                    notificationService.createTargetedNotification(
                            user.getEmail(), title, message, type, booking.getId())
            );
        } catch (Exception e) {
            // Don't let notification failure break the booking flow
        }
    }
}
