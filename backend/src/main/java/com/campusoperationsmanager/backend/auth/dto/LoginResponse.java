package com.campusoperationsmanager.backend.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;   // JWT — frontend stores this and sends it with every request
    private Long id;
    private String name;
    private String email;
    private String role;    // USER / MANAGER / ADMIN / TECHNICIAN
    private String profilePicture;
}