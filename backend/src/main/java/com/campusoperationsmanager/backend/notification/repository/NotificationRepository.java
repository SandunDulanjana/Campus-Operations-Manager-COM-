package com.campusoperationsmanager.backend.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.campusoperationsmanager.backend.notification.model.AppNotification;

public interface NotificationRepository extends JpaRepository<AppNotification, Long> {

    // Get all notifications targeted at a specific email
    List<AppNotification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    // Get all broadcast notifications (recipientEmail is null)
    @Query("SELECT n FROM AppNotification n WHERE n.read = false AND n.recipientEmail IS NULL ORDER BY n.createdAt DESC")
    List<AppNotification> findAllPublishedBroadcasts();

    // Admin: get ALL notifications (including drafts)
    List<AppNotification> findAllByOrderByCreatedAtDesc();
}