package com.campusoperationsmanager.backend.booking;

public class ApiErrorResponse {

    private final String error;

    public ApiErrorResponse(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }
}
