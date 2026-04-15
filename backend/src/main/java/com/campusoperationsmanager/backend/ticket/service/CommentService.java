package com.campusoperationsmanager.backend.ticket.service;

import com.campusoperationsmanager.backend.ticket.dto.CreateCommentRequest;
import com.campusoperationsmanager.backend.ticket.dto.TicketResponse;
import com.campusoperationsmanager.backend.ticket.exception.TicketException;
import com.campusoperationsmanager.backend.ticket.model.Ticket;
import com.campusoperationsmanager.backend.ticket.model.TicketComment;
import com.campusoperationsmanager.backend.ticket.repository.TicketCommentRepository;
import com.campusoperationsmanager.backend.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    public TicketResponse.CommentResponse addComment(Long ticketId,
                                                      CreateCommentRequest request,
                                                      String authorEmail) {
        // Check ticket exists first
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> TicketException.notFound(ticketId));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .content(request.getContent())
                .authorEmail(authorEmail)
                .build();

        return toResponse(commentRepository.save(comment));
    }

    public TicketResponse.CommentResponse updateComment(Long commentId,
                                                         CreateCommentRequest request,
                                                         String userEmail) {
        TicketComment comment = findCommentOrThrow(commentId);

        // OWNERSHIP CHECK: only the person who wrote it can edit it
        if (!comment.getAuthorEmail().equals(userEmail)) {
            throw TicketException.forbidden("edit someone else's comment");
        }

        comment.setContent(request.getContent());
        return toResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId, String userEmail, boolean isAdmin) {
        TicketComment comment = findCommentOrThrow(commentId);

        // Authors can delete their own comments
        // Admins can delete any comment
        boolean isOwner = comment.getAuthorEmail().equals(userEmail);
        if (!isAdmin && !isOwner) {
            throw TicketException.forbidden("delete someone else's comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse.CommentResponse> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private TicketComment findCommentOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new TicketException("Comment not found: " + id, 404));
    }

    private TicketResponse.CommentResponse toResponse(TicketComment c) {
        return TicketResponse.CommentResponse.builder()
                .id(c.getId())
                .content(c.getContent())
                .authorEmail(c.getAuthorEmail())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}