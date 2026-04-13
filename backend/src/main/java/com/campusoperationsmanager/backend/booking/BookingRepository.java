package com.campusoperationsmanager.backend.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByStatusAndBookingDateBetweenOrderByBookingDateAscStartTimeAsc(
        BookingStatus status,
        LocalDate startDate,
        LocalDate endDate
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE (:date IS NULL OR b.bookingDate = :date)
          AND (:resourceType IS NULL OR b.resourceType = :resourceType)
          AND (:status IS NULL OR b.status = :status)
        ORDER BY b.createdAt DESC
        """)
    List<Booking> findAllWithFilters(
        @Param("date") LocalDate date,
        @Param("resourceType") String resourceType,
        @Param("status") BookingStatus status
    );

    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
        FROM Booking b
        WHERE b.resourceId = :resourceId
          AND b.bookingDate = :bookingDate
          AND b.status = 'APPROVED'
          AND b.startTime < :endTime
          AND b.endTime > :startTime
        """)
    boolean hasApprovedOverlap(
        @Param("resourceId") Long resourceId,
        @Param("bookingDate") LocalDate bookingDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
}
