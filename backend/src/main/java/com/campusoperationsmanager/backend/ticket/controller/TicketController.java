package com.campusoperationsmanager.backend.ticket.controller;

import com.campusoperationsmanager.backend.ticket.dto.CreateTicketRequest;
import com.campusoperationsmanager.backend.ticket.dto.TicketResponse;
import com.campusoperationsmanager.backend.ticket.dto.UpdateTicketStatusRequest;
import com.campusoperationsmanager.backend.ticket.exception.TicketException;
import com.campusoperationsmanager.backend.ticket.model.TicketStatus;
import com.campusoperationsmanager.backend.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // ── POST /api/v1/tickets ──────────────────────────────────
    // Any logged-in user can create a ticket
    @PostMapping
    public ResponseEntity<TicketResponse> create(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String email = extractEmail(principal);
        TicketResponse response = ticketService.createTicket(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/v1/tickets ───────────────────────────────────
    // Admin: get all tickets, optionally filtered by status
    // Example: GET /api/v1/tickets?status=OPEN
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAll(
            @RequestParam(required = false) TicketStatus status) {

        List<TicketResponse> result = (status != null)
                ? ticketService.getByStatus(status)
                : ticketService.getAll();
        return ResponseEntity.ok(result);
    }

    // ── GET /api/v1/tickets/my ────────────────────────────────
    // Current user's own tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal OAuth2User principal) {

        return ResponseEntity.ok(ticketService.getMyTickets(extractEmail(principal)));
    }

    // ── GET /api/v1/tickets/assigned ──────────────────────────
    // Technician: tickets assigned to me
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssigned(
            @AuthenticationPrincipal OAuth2User principal) {

        return ResponseEntity.ok(ticketService.getAssignedToMe(extractEmail(principal)));
    }

    // ── GET /api/v1/tickets/{id} ──────────────────────────────
    // Get a single ticket by its ID
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    // ── PATCH /api/v1/tickets/{id}/status ────────────────────
    // Update ticket status (PATCH = partial update, only changing status)
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String email = extractEmail(principal);
        boolean isAdmin = isAdmin(principal);
        return ResponseEntity.ok(ticketService.updateStatus(id, request, email, isAdmin));
    }

    // ── DELETE /api/v1/tickets/{id} ───────────────────────────
    // Admin only: delete a ticket completely
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal) {

        if (!isAdmin(principal)) {
            throw TicketException.forbidden("delete tickets (admin only)");
        }
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
    }

    // ── Helper methods ────────────────────────────────────────
    private String extractEmail(OAuth2User principal) {
        String email = principal.getAttribute("email");
        if (email == null) throw new IllegalStateException("Could not get email from token");
        return email;
    }

    private boolean isAdmin(OAuth2User principal) {
        return principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}