package com.campusoperationsmanager.backend.timetable;

import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private static final String HEADER_USER_ROLE = "X-User-Role";

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadTimetable(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = HEADER_USER_ROLE, defaultValue = "USER") String userRole
    ) {
        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Admin role required for this action"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("File is empty"));
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".csv") && !fileName.endsWith(".xls") && !fileName.endsWith(".xlsx"))) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Only CSV or Excel files are allowed"));
        }

        try {
            TimetableService.TimetableUploadResult result = timetableService.uploadTimetable(file, fileName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to process file: " + e.getMessage()));
        }
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<TimetableSlot>> getWeeklyTimetable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart
    ) {
        List<TimetableSlot> slots = timetableService.getWeeklyTimetable(weekStart);
        return ResponseEntity.ok(slots);
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }

    public record ErrorResponse(String error) {}
}