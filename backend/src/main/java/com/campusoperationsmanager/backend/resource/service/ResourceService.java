package com.campusoperationsmanager.backend.resource.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.campusoperationsmanager.backend.resource.model.Resource;
import com.campusoperationsmanager.backend.resource.repository.ResourceRepository;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(Long resourceId) {
        return resourceRepository.findById(resourceId);
    }

    public Resource saveResource(Resource resource) {
        return resourceRepository.save(resource);
    }
}
