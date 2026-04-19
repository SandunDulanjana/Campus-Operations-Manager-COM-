package com.campusoperationsmanager.backend.notification.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusoperationsmanager.backend.notification.model.NotificationRead;

public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {

    boolean existsByNotificationIdAndUserEmail(Long notificationId, String userEmail);

    List<NotificationRead> findByUserEmail(String userEmail);

    Optional<NotificationRead> findByNotificationIdAndUserEmail(Long notificationId, String userEmail);
}