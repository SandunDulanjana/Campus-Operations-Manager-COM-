package com.campusoperationsmanager.backend.ticket.dto;

import com.campusoperationsmanager.backend.ticket.model.TicketCategory;
import com.campusoperationsmanager.backend.ticket.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// This is what the client sends when creating a ticket
// @Valid in the controller will check these annotations automatically
@Data
public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Location is required")
    private String location;

    private String resourceId;  // Optional: links to a room/equipment from Module A

    @NotBlank(message = "Contact name is required")
    private String contactName;

    private String contactEmail;
    private String contactPhone;
}