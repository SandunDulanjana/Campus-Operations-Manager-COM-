package com.campusoperationsmanager.backend.ticket.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.repository.UserRepository;
import com.campusoperationsmanager.backend.notification.model.NotificationType;
import com.campusoperationsmanager.backend.notification.service.NotificationService;
import com.campusoperationsmanager.backend.ticket.dto.CreateTicketRequest;
import com.campusoperationsmanager.backend.ticket.dto.TicketResponse;
import com.campusoperationsmanager.backend.ticket.dto.UpdateTicketStatusRequest;
import com.campusoperationsmanager.backend.ticket.exception.TicketException;
import com.campusoperationsmanager.backend.ticket.model.Ticket;
import com.campusoperationsmanager.backend.ticket.model.TicketStatus;
import com.campusoperationsmanager.backend.ticket.repository.TicketAttachmentRepository;
import com.campusoperationsmanager.backend.ticket.repository.TicketCommentRepository;
import com.campusoperationsmanager.backend.ticket.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private static final long SLA_FIRST_RESPONSE_MINUTES = 60;
    private static final long SLA_RESOLUTION_MINUTES = 2880;

    // ═══════════════════════════════════════════════════════════
    // CREATE
    // ═══════════════════════════════════════════════════════════

    public TicketResponse createTicket(CreateTicketRequest request, String userEmail) {
        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .location(request.getLocation())
                .resourceId(request.getResourceId())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .createdByEmail(userEmail)
                .status(TicketStatus.OPEN)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        // ── CHANGE: notify all enabled admins about the new ticket ───────────────
        try {
            String adminTitle   = "📩 New Ticket Submitted";
            String adminMessage = "A new ticket #" + savedTicket.getId()
                    + " has been submitted by " + userEmail
                    + " — '" + savedTicket.getTitle() + "'"
                    + " | Category: " + savedTicket.getCategory().name()
                    + " | Priority: " + savedTicket.getPriority().name()
                    + " | Location: " + savedTicket.getLocation()
                    + ". Please review and assign a technician.";

            userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ADMIN && u.isEnabled())
                    .forEach(admin -> {
                        try {
                            notificationService.createTargetedNotification(
                                    admin.getEmail(),
                                    adminTitle,
                                    adminMessage,
                                    NotificationType.TICKET_STATUS_CHANGED,
                                    savedTicket.getId()
                            );
                        } catch (Exception ex) {
                            log.warn("Failed to notify admin {}: {}", admin.getEmail(), ex.getMessage());
                        }
                    });
        } catch (Exception e) {
            log.error("Global notification failure during ticket creation: {}", e.getMessage());
        }
        // ── END CHANGE ───────────────────────────────────────────────────────────

        return toResponse(savedTicket);
    }

    // ═══════════════════════════════════════════════════════════
    // READ
    // ═══════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public TicketResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAll() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(String email) {
        return ticketRepository.findByCreatedByEmailOrderByCreatedAtDesc(email)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAssignedToMe(String email) {
        return ticketRepository.findByAssignedToEmailOrderByCreatedAtDesc(email)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════
    // UPDATE STATUS
    // ═══════════════════════════════════════════════════════════

    public TicketResponse updateStatus(Long id,
                                       UpdateTicketStatusRequest request,
                                       String userEmail,
                                       boolean isAdmin) {
        Ticket ticket = findOrThrow(id);
        TicketStatus newStatus = request.getStatus();

        validateTransition(ticket.getStatus(), newStatus, isAdmin);

        // SLA: record first response time
        if (ticket.getStatus() == TicketStatus.OPEN
                && newStatus != TicketStatus.OPEN
                && ticket.getFirstResponseAt() == null) {

            LocalDateTime now = LocalDateTime.now();
            ticket.setFirstResponseAt(now);

            long minutesTaken = ChronoUnit.MINUTES.between(ticket.getCreatedAt(), now);
            if (minutesTaken > SLA_FIRST_RESPONSE_MINUTES) {
                ticket.setSlaBreached(true);
            }
        }

        // Capture assigned technician email before switch so we can notify after save
        String technicianEmailToNotify = null;

        switch (newStatus) {

            case IN_PROGRESS -> {
                if (request.getAssignedToEmail() != null
                        && !request.getAssignedToEmail().isBlank()) {
                    String newTechEmail = request.getAssignedToEmail().trim();
                    ticket.setAssignedToEmail(newTechEmail);
                    technicianEmailToNotify = newTechEmail;
                }
            }

            case RESOLVED -> {
                if (request.getResolutionNotes() == null
                        || request.getResolutionNotes().isBlank()) {
                    throw TicketException.badRequest(
                            "Resolution notes are required when resolving a ticket");
                }
                ticket.setResolutionNotes(request.getResolutionNotes());

                LocalDateTime now = LocalDateTime.now();
                ticket.setResolvedAt(now);
                long minutesToResolve = ChronoUnit.MINUTES.between(ticket.getCreatedAt(), now);
                if (minutesToResolve > SLA_RESOLUTION_MINUTES) {
                    ticket.setSlaBreached(true);
                }
            }

            case REJECTED -> {
                if (!isAdmin) {
                    throw TicketException.forbidden("reject tickets (admin only)");
                }
                if (request.getRejectionReason() == null
                        || request.getRejectionReason().isBlank()) {
                    throw TicketException.badRequest("Rejection reason is required");
                }
                ticket.setRejectionReason(request.getRejectionReason());
            }

            default -> { /* CLOSED: no extra data needed */ }
        }

        ticket.setStatus(newStatus);
        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify ticket creator about status change
        try {
            notificationService.createTargetedNotification(
                    savedTicket.getCreatedByEmail(),
                    "Ticket Status Updated",
                    "Your ticket '" + savedTicket.getTitle() + "' status changed to "
                            + newStatus.name().replace("_", " "),
                    NotificationType.TICKET_STATUS_CHANGED,
                    savedTicket.getId()
            );
        } catch (Exception e) {
            // Don't let notification failure break the ticket flow
        }

        // Notify assigned technician when admin assigns them
        if (technicianEmailToNotify != null) {
            try {
                notificationService.createTargetedNotification(
                        technicianEmailToNotify,
                        "🔧 You Have Been Assigned a Ticket",
                        "You have been assigned to ticket #" + savedTicket.getId()
                                + " — '" + savedTicket.getTitle() + "'"
                                + " | Priority: " + savedTicket.getPriority().name()
                                + " | Location: " + savedTicket.getLocation()
                                + ". Please review and take action.",
                        NotificationType.TICKET_STATUS_CHANGED,
                        savedTicket.getId()
                );
            } catch (Exception e) {
                // Don't let notification failure break the ticket flow
            }
        }

        // Notify all admins when a technician (non-admin) acts on a ticket
        if (!isAdmin) {
            String statusLabel = newStatus.name().replace("_", " ");
            String adminMessage = "Technician '" + userEmail + "' updated ticket #"
                    + savedTicket.getId() + " '" + savedTicket.getTitle()
                    + "' to " + statusLabel + ".";

            if (newStatus == TicketStatus.RESOLVED) {
                adminMessage += " Resolution notes: "
                        + (savedTicket.getResolutionNotes() != null
                                ? savedTicket.getResolutionNotes() : "—")
                        + ". You may now close this ticket.";
            }

            final String finalAdminMessage = adminMessage;
            try {
                userRepository.findAll().stream()
                        .filter(u -> u.getRole() == User.Role.ADMIN && u.isEnabled())
                        .forEach(admin -> {
                            try {
                                notificationService.createTargetedNotification(
                                        admin.getEmail(),
                                        "🔧 Ticket Updated by Technician",
                                        finalAdminMessage,
                                        NotificationType.TICKET_STATUS_CHANGED,
                                        savedTicket.getId()
                                );
                            } catch (Exception ignored) { }
                        });
            } catch (Exception e) {
                // Don't let notification failure break the ticket flow
            }
        }

        return toResponse(savedTicket);
    }

    // ═══════════════════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════════════════

    public void deleteTicket(Long id) {
        Ticket ticket = findOrThrow(id);
        ticketRepository.delete(ticket);
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    private void validateTransition(TicketStatus current, TicketStatus next, boolean isAdmin) {
        boolean allowed = switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED    || next == TicketStatus.REJECTED;
            case RESOLVED    -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!allowed) {
            throw TicketException.conflict(
                    "Cannot transition from " + current + " to " + next);
        }
    }

    private Ticket findOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> TicketException.notFound(id));
    }

    private TicketResponse toResponse(Ticket ticket) {

        Long minutesToFirstResponse = null;
        Long minutesToResolution = null;

        if (ticket.getFirstResponseAt() != null) {
            minutesToFirstResponse = ChronoUnit.MINUTES.between(
                    ticket.getCreatedAt(), ticket.getFirstResponseAt());
        }
        if (ticket.getResolvedAt() != null) {
            minutesToResolution = ChronoUnit.MINUTES.between(
                    ticket.getCreatedAt(), ticket.getResolvedAt());
        }

        List<TicketResponse.CommentResponse> comments = commentRepository
                .findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(c -> TicketResponse.CommentResponse.builder()
                        .id(c.getId())
                        .content(c.getContent())
                        .authorEmail(c.getAuthorEmail())
                        .createdAt(c.getCreatedAt())
                        .updatedAt(c.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        List<TicketResponse.AttachmentInfo> attachments = attachmentRepository
                .findByTicketId(ticket.getId())
                .stream()
                .map(a -> TicketResponse.AttachmentInfo.builder()
                        .id(a.getId())
                        .fileName(a.getFileName())
                        .fileType(a.getFileType())
                        .fileSize(a.getFileSize())
                        .uploadedAt(a.getUploadedAt())
                        .uploadedByEmail(a.getUploadedByEmail())
                        .build())
                .collect(Collectors.toList());

        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .location(ticket.getLocation())
                .resourceId(ticket.getResourceId())
                .contactName(ticket.getContactName())
                .contactEmail(ticket.getContactEmail())
                .contactPhone(ticket.getContactPhone())
                .createdByEmail(ticket.getCreatedByEmail())
                .assignedToEmail(ticket.getAssignedToEmail())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .firstResponseAt(ticket.getFirstResponseAt())
                .resolvedAt(ticket.getResolvedAt())
                .slaBreached(ticket.isSlaBreached())
                .minutesToFirstResponse(minutesToFirstResponse)
                .minutesToResolution(minutesToResolution)
                .comments(comments)
                .attachments(attachments)
                .build();
    }
}