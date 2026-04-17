package com.campusoperationsmanager.backend.auth.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String username;       // read-only in UI
    private String name;
    private String profilePicture;
    private String phone;
    private String department;
    private String role;
    private boolean enabled;
    private boolean hasPassword;   // false = Google-only account (no campus password yet)
    private LocalDateTime createdAt;
}