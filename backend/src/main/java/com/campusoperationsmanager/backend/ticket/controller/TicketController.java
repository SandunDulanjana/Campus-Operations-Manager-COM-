package com.campusoperationsmanager.backend.ticket.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;
import com.campusoperationsmanager.backend.ticket.dto.CreateTicketRequest;
import com.campusoperationsmanager.backend.ticket.dto.TicketResponse;
import com.campusoperationsmanager.backend.ticket.dto.UpdateTicketStatusRequest;
import com.campusoperationsmanager.backend.ticket.exception.TicketException;
import com.campusoperationsmanager.backend.ticket.model.TicketStatus;
import com.campusoperationsmanager.backend.ticket.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    // ── POST /api/v1/tickets ──────────────────────────────────
    // Any logged-in user can create a ticket
    @PostMapping
    public ResponseEntity<TicketResponse> create(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        String email = user.getEmail();
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
            @AuthenticationPrincipal Long userId) {

        return ResponseEntity.ok(ticketService.getMyTickets(requireUser(userId).getEmail()));
    }

    // ── GET /api/v1/tickets/assigned ──────────────────────────
    // Technician: tickets assigned to me
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssigned(
            @AuthenticationPrincipal Long userId) {

        return ResponseEntity.ok(ticketService.getAssignedToMe(requireUser(userId).getEmail()));
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
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        String email = user.getEmail();
        boolean isAdmin = isAdmin(user);
        return ResponseEntity.ok(ticketService.updateStatus(id, request, email, isAdmin));
    }

    // ── DELETE /api/v1/tickets/{id} ───────────────────────────
    // Admin only: delete a ticket completely
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        if (!isAdmin(user)) {
            throw TicketException.forbidden("delete tickets (admin only)");
        }
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
    }

    // ── Helper methods ────────────────────────────────────────
    private User requireUser(Long userId) {
        if (userId == null) {
            throw new IllegalStateException("Authenticated user id is missing");
        }
        return userService.getUserById(userId);
    }

    private boolean isAdmin(User user) {
        return user.getRole() == User.Role.ADMIN;
    }
}
