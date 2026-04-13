package com.campusoperationsmanager.backend.resource.config;

import com.campusoperationsmanager.backend.resource.model.Resource;
import com.campusoperationsmanager.backend.resource.model.ResourceStatus;
import com.campusoperationsmanager.backend.resource.model.ResourceType;
import com.campusoperationsmanager.backend.resource.repository.ResourceRepository;
import java.time.LocalTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ResourceDataSeeder {

    @Bean
    CommandLineRunner seedResources(ResourceRepository resourceRepository) {
        return args -> {
            if (resourceRepository.count() > 0) {
                return;
            }

            resourceRepository.saveAll(List.of(
                buildResource("A-301 Meeting Room", ResourceType.MEETING_ROOM, 16, "A Block", ResourceStatus.ACTIVE),
                buildResource("Main Auditorium", ResourceType.LECTURE_HALL, 120, "Main Building", ResourceStatus.ACTIVE),
                buildResource("Networking Lab", ResourceType.LAB, 40, "Tech Wing", ResourceStatus.ACTIVE),
                buildResource("Projector Set 01", ResourceType.EQUIPMENT, null, "Media Room", ResourceStatus.ACTIVE),
                buildResource("Projector Set 02", ResourceType.EQUIPMENT, null, "Media Room", ResourceStatus.OUT_OF_SERVICE)
            ));
        };
    }

    private Resource buildResource(
        String name,
        ResourceType type,
        Integer capacity,
        String location,
        ResourceStatus status
    ) {
        Resource resource = new Resource();
        resource.setName(name);
        resource.setType(type);
        resource.setCapacity(capacity);
        resource.setLocation(location);
        resource.setStatus(status);
        resource.setAvailabilityStart(LocalTime.of(8, 0));
        resource.setAvailabilityEnd(LocalTime.of(18, 0));
        return resource;
    }
}
