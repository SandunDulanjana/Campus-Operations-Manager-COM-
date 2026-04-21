package com.campusoperationsmanager.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    private String email;

    private String username;   // optional — admin may pre-assign campus username

    @NotNull(message = "Role is required")
    private String role;       // USER | TECHNICIAN | BOOKINGMNG | RECOURSEMNG | MAINTENANCEMNG | ADMIN

    private String phone;
    private String department;
}