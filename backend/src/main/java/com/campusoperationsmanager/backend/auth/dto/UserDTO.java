package com.campusoperationsmanager.backend.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

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