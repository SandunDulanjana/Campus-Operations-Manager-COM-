package com.campusoperationsmanager.backend.notification.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateNotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    // "ALL" or comma-separated roles: "USER", "ADMIN", "TECHNICIAN"
    // If null/empty, defaults to "ALL"
    private List<String> audienceRoles;

    // If true, notification is live immediately; false = draft
    private boolean published = true;
}