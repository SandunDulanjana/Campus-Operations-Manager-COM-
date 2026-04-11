package com.campusoperationsmanager.backend.booking.resource;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ResourceCatalogService {

    private final List<ResourceCatalog> resources = new ArrayList<>();

    @PostConstruct
    void seedResources() {
        if (!resources.isEmpty()) {
            return;
        }
        resources.add(new ResourceCatalog(1L, "A-301 Meeting Room", "MEETING_ROOM", 16, "ACTIVE"));
        resources.add(new ResourceCatalog(2L, "Main Auditorium", "LECTURE_HALL", 120, "ACTIVE"));
        resources.add(new ResourceCatalog(3L, "Networking Lab", "LAB", 40, "ACTIVE"));
        resources.add(new ResourceCatalog(4L, "Projector Set 01", "EQUIPMENT", null, "ACTIVE"));
        resources.add(new ResourceCatalog(5L, "Projector Set 02", "EQUIPMENT", null, "OUT_OF_SERVICE"));
    }

    public List<ResourceCatalog> findAll() {
        return resources.stream()
            .sorted(Comparator.comparing(ResourceCatalog::getName))
            .toList();
    }

    public Optional<ResourceCatalog> findById(Long id) {
        return resources.stream().filter(resource -> resource.getId().equals(id)).findFirst();
    }
}
