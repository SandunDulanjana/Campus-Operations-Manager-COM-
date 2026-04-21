package com.campusoperationsmanager.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InviteCompleteRequest {

    @NotBlank(message = "Invite token is required")
    private String token;

    // Required for campus-login path, absent when user chose Google instead
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}