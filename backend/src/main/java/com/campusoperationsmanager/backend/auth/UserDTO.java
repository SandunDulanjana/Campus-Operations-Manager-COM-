package com.campusoperationsmanager.backend.auth;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

// DTO = Data Transfer Object
// What we actually send to the frontend — clean, safe subset of User
@Data
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String profilePicture;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;
}