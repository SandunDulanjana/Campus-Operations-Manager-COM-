package com.campusoperationsmanager.backend.ticket.service;

import com.campusoperationsmanager.backend.ticket.dto.CreateTicketRequest;
import com.campusoperationsmanager.backend.ticket.dto.TicketResponse;
import com.campusoperationsmanager.backend.ticket.dto.UpdateTicketStatusRequest;
import com.campusoperationsmanager.backend.ticket.exception.TicketException;
import com.campusoperationsmanager.backend.ticket.model.*;
import com.campusoperationsmanager.backend.ticket.repository.TicketAttachmentRepository;
import com.campusoperationsmanager.backend.ticket.repository.TicketCommentRepository;
import com.campusoperationsmanager.backend.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service              // Marks this as a Spring-managed service bean
@RequiredArgsConstructor  // Lombok: constructor injection for all final fields
@Transactional        // All methods run inside a DB transaction by default
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;

    // SLA Thresholds
    // If first response takes longer than 60 min → SLA breached
    private static final long SLA_FIRST_RESPONSE_MINUTES = 60;
    // If resolution takes longer than 2 days → SLA breached
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

        return toResponse(ticketRepository.save(ticket));
    }

    // ═══════════════════════════════════════════════════════════
    // READ
    // ═══════════════════════════════════════════════════════════

    @Transactional(readOnly = true) // Optimization: no write lock needed
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
    // UPDATE STATUS (Core workflow logic)
    // ═══════════════════════════════════════════════════════════

    public TicketResponse updateStatus(Long id,
                                       UpdateTicketStatusRequest request,
                                       String userEmail,
                                       boolean isAdmin) {
        Ticket ticket = findOrThrow(id);
        TicketStatus newStatus = request.getStatus();

        // 1. Check if this transition is allowed
        validateTransition(ticket.getStatus(), newStatus, isAdmin);

        // 2. SLA: record first response time (when ticket leaves OPEN state)
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

        // 3. Handle each transition's specific requirements
        switch (newStatus) {

            case IN_PROGRESS -> {
                // Assign a technician
                if (request.getAssignedToEmail() != null && !request.getAssignedToEmail().isBlank()) {
                    ticket.setAssignedToEmail(request.getAssignedToEmail());
                }
            }

            case RESOLVED -> {
                // Resolution notes are REQUIRED
                if (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank()) {
                    throw TicketException.badRequest("Resolution notes are required when resolving a ticket");
                }
                ticket.setResolutionNotes(request.getResolutionNotes());

                // SLA: record resolution time
                LocalDateTime now = LocalDateTime.now();
                ticket.setResolvedAt(now);
                long minutesToResolve = ChronoUnit.MINUTES.between(ticket.getCreatedAt(), now);
                if (minutesToResolve > SLA_RESOLUTION_MINUTES) {
                    ticket.setSlaBreached(true);
                }
            }

            case REJECTED -> {
                // Only admin can reject, and reason is REQUIRED
                if (!isAdmin) {
                    throw TicketException.forbidden("reject tickets (admin only)");
                }
                if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                    throw TicketException.badRequest("Rejection reason is required");
                }
                ticket.setRejectionReason(request.getRejectionReason());
            }

            default -> { /* CLOSED: no extra data needed */ }
        }

        ticket.setStatus(newStatus);
        return toResponse(ticketRepository.save(ticket));
    }

    // ═══════════════════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════════════════

    public void deleteTicket(Long id) {
        Ticket ticket = findOrThrow(id);
        ticketRepository.delete(ticket);
        // Cascade will automatically delete comments and attachments
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    // Validate the status workflow: OPEN→IN_PROGRESS→RESOLVED→CLOSED
    private void validateTransition(TicketStatus current, TicketStatus next, boolean isAdmin) {
        boolean allowed = switch (current) {
            // From OPEN: can go to IN_PROGRESS, or REJECTED (admin)
            case OPEN       -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            // From IN_PROGRESS: can go to RESOLVED, or REJECTED (admin)
            case IN_PROGRESS -> next == TicketStatus.RESOLVED  || next == TicketStatus.REJECTED;
            // From RESOLVED: can only go to CLOSED
            case RESOLVED    -> next == TicketStatus.CLOSED;
            // CLOSED and REJECTED are terminal — no further transitions
            case CLOSED, REJECTED -> false;
        };

        if (!allowed) {
            throw TicketException.conflict(
                "Cannot transition from " + current + " to " + next
            );
        }
    }

    // Find ticket or throw a clean 404
    private Ticket findOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> TicketException.notFound(id));
    }

    // Map Ticket entity → TicketResponse DTO
    // This runs for every ticket before sending to client
    private TicketResponse toResponse(Ticket ticket) {

        // Calculate SLA durations
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

        // Map comments
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

        // Map attachments (metadata only, not fileData)
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