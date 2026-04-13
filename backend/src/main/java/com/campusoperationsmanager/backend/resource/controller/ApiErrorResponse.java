package com.campusoperationsmanager.backend.resource.controller;

public class ApiErrorResponse {

    private final String error;

    public ApiErrorResponse(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }
}
