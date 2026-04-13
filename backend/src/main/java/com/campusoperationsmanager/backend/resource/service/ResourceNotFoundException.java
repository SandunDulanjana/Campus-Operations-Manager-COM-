package com.campusoperationsmanager.backend.resource.service;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(Long resourceId) {
        super("Resource not found for id " + resourceId);
    }
}
