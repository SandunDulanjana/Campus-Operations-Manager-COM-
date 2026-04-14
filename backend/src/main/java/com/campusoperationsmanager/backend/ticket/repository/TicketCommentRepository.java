package com.campusoperationsmanager.backend.ticket.repository;

import com.campusoperationsmanager.backend.ticket.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    // Get all comments for a ticket, oldest first (for chat-like display)
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}