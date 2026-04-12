package com.campusoperationsmanager.backend.timetable;

import com.campusoperationsmanager.backend.booking.resource.ResourceCatalog;
import com.campusoperationsmanager.backend.booking.resource.ResourceCatalogService;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TimetableService {

    private static final Logger log = LoggerFactory.getLogger(TimetableService.class);

    private final TimetableSlotRepository timetableSlotRepository;
    private final ResourceCatalogService resourceCatalogService;

    public TimetableService(TimetableSlotRepository timetableSlotRepository,
                            ResourceCatalogService resourceCatalogService) {
        this.timetableSlotRepository = timetableSlotRepository;
        this.resourceCatalogService = resourceCatalogService;
    }

    public TimetableUploadResult uploadTimetable(MultipartFile file, String fileName) throws IOException {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        List<TimetableSlot> slots = new ArrayList<>();

        if ("csv".equals(extension)) {
            slots = parseCsv(file.getInputStream());
        } else if ("xls".equals(extension) || "xlsx".equals(extension)) {
            slots = parseExcel(file.getInputStream(), extension);
        } else {
            throw new IllegalArgumentException("Unsupported file format. Please upload CSV or Excel file.");
        }

        int inserted = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < slots.size(); i++) {
            try {
                TimetableSlot slot = slots.get(i);
                if (slot.getResourceId() != null) {
                    timetableSlotRepository.save(slot);
                    inserted++;
                } else {
                    skipped++;
                }
            } catch (Exception e) {
                errors.add("Row " + (i + 2) + ": " + e.getMessage());
            }
        }

        return new TimetableUploadResult(inserted, skipped, errors);
    }

    private List<TimetableSlot> parseCsv(InputStream inputStream) throws IOException {
        List<TimetableSlot> slots = new ArrayList<>();
        try (CSVParser parser = org.apache.commons.csv.CSVFormat.DEFAULT
                .withFirstRecordAsHeader()
                .parse(new java.io.InputStreamReader(inputStream))) {

            for (CSVRecord record : parser) {
                String resourceName = getAndTrim(record, "resourceName");
                if (resourceName == null) {
                    resourceName = getAndTrim(record, "Resource Name");
                }

                ResourceCatalog resource = resourceCatalogService.findByName(resourceName).orElse(null);
                if (resource == null) {
                    log.warn("Resource not found: {}", resourceName);
                    continue;
                }

                TimetableSlot slot = new TimetableSlot();
                slot.setResourceId(resource.getId());
                slot.setResourceName(resource.getName());
                slot.setResourceType(resource.getType());
                slot.setSlotDate(parseDate(getAndTrim(record, "slotDate")));
                slot.setStartTime(parseTime(getAndTrim(record, "startTime")));
                slot.setEndTime(parseTime(getAndTrim(record, "endTime")));
                slot.setFacultyName(getAndTrim(record, "facultyName"));
                slot.setCourseCode(getAndTrim(record, "courseCode"));
                slot.setSourceFile("import");

                slots.add(slot);
            }
        }
        return slots;
    }

    private List<TimetableSlot> parseExcel(InputStream inputStream, String extension) {
        List<TimetableSlot> slots = new ArrayList<>();
        return slots;
    }

    private String getAndTrim(CSVRecord record, String field) {
        try {
            String value = record.get(field);
            return (value == null || value.trim().isEmpty()) ? null : value.trim();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null) return null;
        try {
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            try {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
                return LocalDate.parse(dateStr, formatter);
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null) return null;
        try {
            return LocalTime.parse(timeStr);
        } catch (DateTimeParseException e) {
            try {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
                return LocalTime.parse(timeStr, formatter);
            } catch (Exception ex) {
                return null;
            }
        }
    }

    public List<TimetableSlot> getWeeklyTimetable(LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        return timetableSlotRepository.findByDateRange(weekStart, weekEnd);
    }

    public boolean hasConflict(Long resourceId, LocalDate date, LocalTime start, LocalTime end) {
        List<TimetableSlot> conflicts = timetableSlotRepository.findConflicts(resourceId, date, start, end);
        return !conflicts.isEmpty();
    }

    public record TimetableUploadResult(int inserted, int skipped, List<String> errors) {}
}