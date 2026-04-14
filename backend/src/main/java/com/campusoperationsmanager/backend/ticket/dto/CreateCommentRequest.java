package com.campusoperationsmanager.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCommentRequest {

    @NotBlank(message = "Comment cannot be empty")
    private String content;
}