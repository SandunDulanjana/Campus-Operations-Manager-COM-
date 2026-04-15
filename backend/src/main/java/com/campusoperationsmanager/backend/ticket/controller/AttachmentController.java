package com.campusoperationsmanager.backend.ticket.controller;

import com.campusoperationsmanager.backend.ticket.model.TicketAttachment;
import com.campusoperationsmanager.backend.ticket.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    // POST /api/v1/tickets/{ticketId}/attachments
    // multipart/form-data because we're sending a FILE (not JSON)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> upload(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal OAuth2User principal) throws IOException {

        String email = principal.getAttribute("email");
        TicketAttachment saved = attachmentService.upload(ticketId, file, email);

        // Return metadata only, not the file data
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id",           saved.getId(),
                "fileName",     saved.getFileName(),
                "fileType",     saved.getFileType(),
                "fileSize",     saved.getFileSize(),
                "uploadedAt",   saved.getUploadedAt().toString()
        ));
    }

    // GET /api/v1/tickets/{ticketId}/attachments/{attachmentId}/data
    // Returns the actual image so browser can display it
    @GetMapping("/{attachmentId}/data")
    public ResponseEntity<byte[]> getImage(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {

        TicketAttachment attachment = attachmentService.getAttachment(attachmentId);

        // Decode Base64 back to image bytes
        byte[] imageBytes = Base64.getDecoder().decode(attachment.getFileData());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .body(imageBytes);
    }

    // DELETE /api/v1/tickets/{ticketId}/attachments/{attachmentId}
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {

        attachmentService.delete(attachmentId);
        return ResponseEntity.ok(Map.of("message", "Attachment deleted"));
    }
}