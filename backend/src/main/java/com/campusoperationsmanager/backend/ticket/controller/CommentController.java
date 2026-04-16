package com.campusoperationsmanager.backend.ticket.controller;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.service.UserService;
import com.campusoperationsmanager.backend.ticket.dto.CreateCommentRequest;
import com.campusoperationsmanager.backend.ticket.dto.TicketResponse;
import com.campusoperationsmanager.backend.ticket.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

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
            @AuthenticationPrincipal Long userId) {

        String email = requireUser(userId).getEmail();
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
            @AuthenticationPrincipal Long userId) {

        String email = requireUser(userId).getEmail();
        return ResponseEntity.ok(commentService.updateComment(commentId, request, email));
    }

    // DELETE /api/v1/tickets/{ticketId}/comments/{commentId}
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal Long userId) {

        User user = requireUser(userId);
        String email = user.getEmail();
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        commentService.deleteComment(commentId, email, isAdmin);
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }

    private User requireUser(Long userId) {
        if (userId == null) {
            throw new IllegalStateException("Authenticated user id is missing");
        }
        return userService.getUserById(userId);
    }
}
