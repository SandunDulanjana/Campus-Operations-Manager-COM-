package com.campusoperationsmanager.backend.auth.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String username;
    private String name;
    private String profilePicture;
    private String phone;
    private String department;
    private String role;
    private boolean enabled;
    private boolean hasPassword;
    private LocalDateTime createdAt;
    private boolean twoFactorEnabled;
    private String twoFactorMethod;    // "SMS", "TOTP", or null
}