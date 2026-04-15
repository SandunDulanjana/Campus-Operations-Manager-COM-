package com.campusoperationsmanager.backend.resource.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.campusoperationsmanager.backend.resource.model.Resource;
import com.campusoperationsmanager.backend.resource.model.ResourceStatus;
import com.campusoperationsmanager.backend.resource.model.ResourceType;
import com.campusoperationsmanager.backend.resource.repository.ResourceRepository;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    private ResourceService resourceService;

    @BeforeEach
    void setUp() {
        resourceService = new ResourceService(resourceRepository);
    }

    @Test
    void createResource_defaultsMissingStatusToActive() {
        Resource resource = buildRoom();
        resource.setStatus(null);

        when(resourceRepository.save(any(Resource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Resource created = resourceService.createResource(resource);

        assertEquals(ResourceStatus.ACTIVE, created.getStatus());
        verify(resourceRepository).save(resource);
    }

    @Test
    void createResource_rejectsAvailabilityWindowWhenOnlyOneBoundProvided() {
        Resource resource = buildRoom();
        resource.setAvailabilityStart(LocalTime.of(8, 0));
        resource.setAvailabilityEnd(null);

        ResourceValidationException exception = assertThrows(
            ResourceValidationException.class,
            () -> resourceService.createResource(resource)
        );

        assertEquals("availabilityStart and availabilityEnd must both be provided", exception.getMessage());
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void createResource_rejectsNonPositiveCapacityForRooms() {
        Resource resource = buildRoom();
        resource.setCapacity(0);

        ResourceValidationException exception = assertThrows(
            ResourceValidationException.class,
            () -> resourceService.createResource(resource)
        );

        assertEquals("capacity must be a positive number", exception.getMessage());
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void updateResource_normalizesTextFieldsBeforeSave() {
        Long resourceId = 7L;
        Resource existing = buildRoom();
        existing.setId(resourceId);

        Resource payload = buildRoom();
        payload.setName("  Updated Lab  ");
        payload.setLocation("  B-Block  ");

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(existing));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Resource updated = resourceService.updateResource(resourceId, payload);

        assertEquals("Updated Lab", updated.getName());
        assertEquals("B-Block", updated.getLocation());
    }

    @Test
    void deleteResource_throwsWhenResourceMissing() {
        Long resourceId = 11L;
        when(resourceRepository.existsById(resourceId)).thenReturn(false);

        ResourceNotFoundException exception = assertThrows(
            ResourceNotFoundException.class,
            () -> resourceService.deleteResource(resourceId)
        );

        assertEquals("Resource not found for id 11", exception.getMessage());
        verify(resourceRepository, never()).deleteById(any());
    }

    @Test
    void getAllResources_appliesCombinedFilters() {
        Resource matching = buildRoom();
        matching.setType(ResourceType.LAB);
        matching.setCapacity(45);
        matching.setLocation("A-Block Level 2");
        matching.setStatus(ResourceStatus.ACTIVE);

        Resource wrongLocation = buildRoom();
        wrongLocation.setType(ResourceType.LAB);
        wrongLocation.setCapacity(45);
        wrongLocation.setLocation("C-Block");
        wrongLocation.setStatus(ResourceStatus.ACTIVE);

        when(resourceRepository.findAll()).thenReturn(List.of(matching, wrongLocation));

        List<Resource> results = resourceService.getAllResources(
            ResourceType.LAB,
            40,
            "a-block",
            ResourceStatus.ACTIVE
        );

        assertEquals(1, results.size());
        assertEquals("A-Block Level 2", results.getFirst().getLocation());
    }

    @Test
    void createResource_allowsEquipmentWithoutCapacity() {
        Resource equipment = buildEquipment();
        equipment.setCapacity(null);

        ArgumentCaptor<Resource> captor = ArgumentCaptor.forClass(Resource.class);
        when(resourceRepository.save(any(Resource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        resourceService.createResource(equipment);

        verify(resourceRepository).save(captor.capture());
        assertTrue(captor.getValue().getCapacity() == null);
    }

    private Resource buildRoom() {
        Resource resource = new Resource();
        resource.setName("Engineering Lab");
        resource.setType(ResourceType.LAB);
        resource.setCapacity(40);
        resource.setLocation("A-Block");
        resource.setStatus(ResourceStatus.ACTIVE);
        resource.setAvailabilityStart(LocalTime.of(8, 0));
        resource.setAvailabilityEnd(LocalTime.of(17, 0));
        return resource;
    }

    private Resource buildEquipment() {
        Resource resource = new Resource();
        resource.setName("Portable Projector");
        resource.setType(ResourceType.EQUIPMENT);
        resource.setLocation("Media Store");
        resource.setStatus(ResourceStatus.ACTIVE);
        return resource;
    }
}
