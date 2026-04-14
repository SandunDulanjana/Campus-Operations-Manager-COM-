package com.campusoperationsmanager.backend.ticket.repository;

import com.campusoperationsmanager.backend.ticket.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

    List<TicketAttachment> findByTicketId(Long ticketId);

    // COUNT query: how many attachments does this ticket have?
    long countByTicketId(Long ticketId);
}