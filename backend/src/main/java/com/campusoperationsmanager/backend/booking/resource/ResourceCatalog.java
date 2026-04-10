package com.campusoperationsmanager.backend.booking.resource;

public class ResourceCatalog {

    private Long id;
    private String name;
    private String type;
    private Integer capacity;
    private String status;

    public ResourceCatalog(Long id, String name, String type, Integer capacity, String status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getStatus() {
        return status;
    }

    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }
}
