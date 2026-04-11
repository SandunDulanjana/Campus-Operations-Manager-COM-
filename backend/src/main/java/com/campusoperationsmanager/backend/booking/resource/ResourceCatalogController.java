package com.campusoperationsmanager.backend.booking.resource;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceCatalogController {

    private final ResourceCatalogService resourceCatalogService;

    public ResourceCatalogController(ResourceCatalogService resourceCatalogService) {
        this.resourceCatalogService = resourceCatalogService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceCatalog>> getResources() {
        return ResponseEntity.ok(resourceCatalogService.findAll());
    }
}
