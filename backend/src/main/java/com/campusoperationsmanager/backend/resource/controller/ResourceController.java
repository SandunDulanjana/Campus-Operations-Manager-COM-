package com.campusoperationsmanager.backend.resource.controller;

import com.campusoperationsmanager.backend.resource.model.Resource;
import com.campusoperationsmanager.backend.resource.model.ResourceStatus;
import com.campusoperationsmanager.backend.resource.model.ResourceType;
import com.campusoperationsmanager.backend.resource.service.ResourceService;
import com.campusoperationsmanager.backend.resource.service.ResourceNotFoundException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getResources(
        @RequestParam(required = false) ResourceType type,
        @RequestParam(required = false) Integer minCapacity,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) ResourceStatus status
    ) {
        return ResponseEntity.ok(resourceService.getAllResources(type, minCapacity, location, status));
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<Resource> getResource(@PathVariable Long resourceId) {
        Resource resource = resourceService.getResourceById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException(resourceId));
        return ResponseEntity.ok(resource);
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(resource));
    }

    @PutMapping("/{resourceId}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long resourceId, @RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.updateResource(resourceId, resource));
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long resourceId) {
        resourceService.deleteResource(resourceId);
        return ResponseEntity.noContent().build();
    }
}
