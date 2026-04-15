package com.campusoperationsmanager.backend.ticket.repository;

import com.campusoperationsmanager.backend.ticket.model.Ticket;
import com.campusoperationsmanager.backend.ticket.model.TicketPriority;
import com.campusoperationsmanager.backend.ticket.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// JpaRepository<Ticket, Long>
// Ticket = the entity this manages
// Long   = the type of the primary key (id)
// Spring auto-generates: findAll(), findById(), save(), delete() etc.
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Spring reads the METHOD NAME and builds the SQL query automatically
    // findBy + FieldName = WHERE field_name = ?

    // SELECT * FROM tickets WHERE created_by_email = ?
    List<Ticket> findByCreatedByEmailOrderByCreatedAtDesc(String email);

    // SELECT * FROM tickets WHERE status = ?
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    // SELECT * FROM tickets WHERE assigned_to_email = ?
    List<Ticket> findByAssignedToEmailOrderByCreatedAtDesc(String email);

    // SELECT * FROM tickets WHERE priority = ?
    List<Ticket> findByPriorityOrderByCreatedAtDesc(TicketPriority priority);

    // SELECT * FROM tickets ORDER BY created_at DESC
    List<Ticket> findAllByOrderByCreatedAtDesc();
}