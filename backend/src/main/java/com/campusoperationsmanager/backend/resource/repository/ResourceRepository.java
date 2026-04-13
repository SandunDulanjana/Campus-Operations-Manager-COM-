package com.campusoperationsmanager.backend.resource.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusoperationsmanager.backend.resource.model.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
}
