package com.campusoperationsmanager.backend.shared;

public class ApiErrorResponse {
    private final String error;
    public ApiErrorResponse(String error) { this.error = error; }
    public String getError() { return error; }
}