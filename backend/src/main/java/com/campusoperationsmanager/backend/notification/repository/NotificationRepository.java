package com.campusoperationsmanager.backend.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.campusoperationsmanager.backend.notification.model.AppNotification;

public interface NotificationRepository extends JpaRepository<AppNotification, Long> {

    // ← uses field "targetEmail" from AppNotification — matches getTargetEmail()
    List<AppNotification> findByTargetEmailAndPublishedTrueOrderByCreatedAtDesc(String targetEmail);

    @Query("SELECT n FROM AppNotification n WHERE n.published = true AND n.targetEmail IS NULL ORDER BY n.createdAt DESC")
    List<AppNotification> findAllPublishedBroadcasts();

    List<AppNotification> findAllByOrderByCreatedAtDesc();
}