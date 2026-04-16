package com.campusoperationsmanager.backend.resource.service;

import com.campusoperationsmanager.backend.resource.model.Resource;
import com.campusoperationsmanager.backend.resource.model.ResourceStatus;
import com.campusoperationsmanager.backend.resource.model.ResourceType;
import com.campusoperationsmanager.backend.resource.repository.ResourceRepository;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources(
        ResourceType type,
        Integer minCapacity,
        String location,
        ResourceStatus status
    ) {
        String normalizedLocation = normalizeText(location);

        return resourceRepository.findAll().stream()
            .filter(resource -> type == null || resource.getType() == type)
            .filter(resource -> status == null || resource.getStatus() == status)
            .filter(resource -> minCapacity == null || matchesMinCapacity(resource, minCapacity))
            .filter(resource -> normalizedLocation == null || matchesLocation(resource, normalizedLocation))
            .toList();
    }

    public Optional<Resource> getResourceById(Long resourceId) {
        return resourceRepository.findById(resourceId);
    }

    public Resource createResource(Resource resource) {
        validateResource(resource);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long resourceId, Resource payload) {
        validateResource(payload);

        Resource existing = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException(resourceId));

        existing.setName(payload.getName().trim());
        existing.setType(payload.getType());
        existing.setCapacity(payload.getCapacity());
        existing.setLocation(payload.getLocation().trim());
        existing.setStatus(payload.getStatus());
        existing.setAvailabilityStart(payload.getAvailabilityStart());
        existing.setAvailabilityEnd(payload.getAvailabilityEnd());

        return resourceRepository.save(existing);
    }

    public void deleteResource(Long resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException(resourceId);
        }
        resourceRepository.deleteById(resourceId);
    }

    private boolean matchesMinCapacity(Resource resource, Integer minCapacity) {
        return resource.getCapacity() != null && resource.getCapacity() >= minCapacity;
    }

    private boolean matchesLocation(Resource resource, String location) {
        return resource.getLocation() != null
            && resource.getLocation().toLowerCase(Locale.ROOT).contains(location);
    }

    private void validateResource(Resource resource) {
        String normalizedName = normalizeText(resource.getName());
        if (normalizedName == null) {
            throw new ResourceValidationException("name must not be blank");
        }

        String normalizedLocation = normalizeText(resource.getLocation());
        if (normalizedLocation == null) {
            throw new ResourceValidationException("location must not be blank");
        }

        if (resource.getType() == null) {
            throw new ResourceValidationException("type is required");
        }

        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }

        if (resource.getType() == ResourceType.EQUIPMENT) {
            if (resource.getCapacity() != null && resource.getCapacity() <= 0) {
                throw new ResourceValidationException("capacity must be positive when provided");
            }
        } else if (resource.getCapacity() == null || resource.getCapacity() <= 0) {
            throw new ResourceValidationException("capacity must be a positive number");
        }

        if ((resource.getAvailabilityStart() == null) != (resource.getAvailabilityEnd() == null)) {
            throw new ResourceValidationException("availabilityStart and availabilityEnd must both be provided");
        }

        if (resource.getAvailabilityStart() != null
            && !resource.getAvailabilityStart().isBefore(resource.getAvailabilityEnd())) {
            throw new ResourceValidationException("availabilityStart must be before availabilityEnd");
        }

        resource.setName(normalizedName);
        resource.setLocation(normalizedLocation);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
