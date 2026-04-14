package com.campusoperationsmanager.backend.ticket.controller;

import com.campusoperationsmanager.backend.ticket.dto.CreateCommentRequest;
import com.campusoperationsmanager.backend.ticket.dto.TicketResponse;
import com.campusoperationsmanager.backend.ticket.service.CommentService;
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
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // GET /api/v1/tickets/{ticketId}/comments
    @GetMapping
    public ResponseEntity<List<TicketResponse.CommentResponse>> getAll(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    // POST /api/v1/tickets/{ticketId}/comments
    @PostMapping
    public ResponseEntity<TicketResponse.CommentResponse> add(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String email = principal.getAttribute("email");
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(commentService.addComment(ticketId, request, email));
    }

    // PUT /api/v1/tickets/{ticketId}/comments/{commentId}
    // PUT = replace the whole thing (we're replacing comment content)
    @PutMapping("/{commentId}")
    public ResponseEntity<TicketResponse.CommentResponse> update(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String email = principal.getAttribute("email");
        return ResponseEntity.ok(commentService.updateComment(commentId, request, email));
    }

    // DELETE /api/v1/tickets/{ticketId}/comments/{commentId}
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal OAuth2User principal) {

        String email = principal.getAttribute("email");
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        commentService.deleteComment(commentId, email, isAdmin);
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }
}