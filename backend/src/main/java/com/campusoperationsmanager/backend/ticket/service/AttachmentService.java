package com.campusoperationsmanager.backend.ticket.service;

import com.campusoperationsmanager.backend.ticket.exception.TicketException;
import com.campusoperationsmanager.backend.ticket.model.Ticket;
import com.campusoperationsmanager.backend.ticket.model.TicketAttachment;
import com.campusoperationsmanager.backend.ticket.repository.TicketAttachmentRepository;
import com.campusoperationsmanager.backend.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    private static final int  MAX_ATTACHMENTS = 3;
    private static final long MAX_FILE_SIZE   = 5 * 1024 * 1024; // 5 MB in bytes

    public TicketAttachment upload(Long ticketId, MultipartFile file,
                                   String uploaderEmail) throws IOException {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> TicketException.notFound(ticketId));

        // Rule 1: max 3 attachments per ticket
        long count = attachmentRepository.countByTicketId(ticketId);
        if (count >= MAX_ATTACHMENTS) {
            throw TicketException.badRequest(
                "Maximum " + MAX_ATTACHMENTS + " attachments allowed per ticket"
            );
        }

        // Rule 2: only image files
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw TicketException.badRequest("Only image files (JPG, PNG, etc.) are allowed");
        }

        // Rule 3: max file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw TicketException.badRequest("File size must not exceed 5MB");
        }

        // Convert image bytes to Base64 string for storage
        // Base64 turns binary data into safe text characters
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());

        TicketAttachment attachment = TicketAttachment.builder()
                .ticket(ticket)
                .fileName(file.getOriginalFilename())
                .fileType(contentType)
                .fileData(base64)
                .fileSize(file.getSize())
                .uploadedByEmail(uploaderEmail)
                .build();

        return attachmentRepository.save(attachment);
    }

    @Transactional(readOnly = true)
    public TicketAttachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new TicketException("Attachment not found: " + attachmentId, 404));
    }

    public void delete(Long attachmentId) {
        TicketAttachment att = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new TicketException("Attachment not found: " + attachmentId, 404));
        attachmentRepository.delete(att);
    }
}