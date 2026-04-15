package com.campusoperationsmanager.backend.timetable;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    @Query("""
        SELECT t FROM TimetableSlot t
        WHERE (:resourceId IS NULL OR t.resourceId = :resourceId)
          AND (:slotDate IS NULL OR t.slotDate = :slotDate)
        ORDER BY t.slotDate, t.startTime
        """)
    List<TimetableSlot> findByFilters(
        @Param("resourceId") Long resourceId,
        @Param("slotDate") LocalDate slotDate
    );

    @Query("""
        SELECT t FROM TimetableSlot t
        WHERE t.resourceId = :resourceId
          AND t.slotDate = :slotDate
          AND t.startTime < :endTime
          AND t.endTime > :startTime
        """)
    List<TimetableSlot> findConflicts(
        @Param("resourceId") Long resourceId,
        @Param("slotDate") LocalDate slotDate,
        @Param("startTime") java.time.LocalTime startTime,
        @Param("endTime") java.time.LocalTime endTime
    );

    @Query("""
        SELECT t FROM TimetableSlot t
        WHERE t.slotDate >= :startDate AND t.slotDate <= :endDate
        ORDER BY t.slotDate, t.resourceName, t.startTime
        """)
    List<TimetableSlot> findByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}