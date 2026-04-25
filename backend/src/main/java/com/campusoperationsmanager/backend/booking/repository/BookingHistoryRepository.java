package com.campusoperationsmanager.backend.booking.repository;

import com.campusoperationsmanager.backend.booking.model.BookingHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingHistoryRepository extends JpaRepository<BookingHistory, Long> {

    List<BookingHistory> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
}
