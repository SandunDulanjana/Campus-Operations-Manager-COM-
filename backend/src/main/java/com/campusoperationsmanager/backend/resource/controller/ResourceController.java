package com.campusoperationsmanager.backend.resource.controller;

import com.campusoperationsmanager.backend.booking.BookingValidationException;
import com.campusoperationsmanager.backend.resource.model.Resource;
import com.campusoperationsmanager.backend.resource.service.ResourceService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<Resource> getResource(@PathVariable Long resourceId) {
        Resource resource = resourceService.getResourceById(resourceId)
            .orElseThrow(() -> new BookingValidationException("Selected resource does not exist"));
        return ResponseEntity.ok(resource);
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.saveResource(resource));
    }
}
