package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Admin Maintenance Controller
 * Provides administrative utilities for database cleanup and maintenance
 *
 * @author Team C - Backend Lead
 * @version 1.0
 * @since 2025-11-30
 */
@RestController
@RequestMapping("/api/admin/maintenance")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminMaintenanceController {

    private final Team.C.Service.Spot.service.MaintenanceService maintenanceService;

    /**
     * Delete availability for a specific date
     * Useful for cleaning up test data or erroneous entries
     *
     * @param date The date to delete (format: YYYY-MM-DD)
     * @return Number of records deleted
     */
    @DeleteMapping("/availability/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> deleteAvailabilityByDate(
            @PathVariable String date) {

        log.warn("🗑️ Admin requested deletion of availability for date: {}", date);

        LocalDate targetDate = LocalDate.parse(date);
        int deletedCount = maintenanceService.deleteAvailabilityByDate(targetDate);

        log.info("✅ Deleted {} availability records for date: {}", deletedCount, date);

        return ResponseEntity.ok(
            ApiResponse.success("Deleted " + deletedCount + " records for date: " + date, deletedCount)
        );
    }

    /**
     * Clean up past availability records
     * Removes all availability older than specified days
     *
     * @param daysOld Delete records older than this many days (default: 30)
     * @return Number of records deleted
     */
    @DeleteMapping("/availability/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> cleanupOldAvailability(
            @RequestParam(defaultValue = "30") int daysOld) {

        log.warn("🗑️ Admin requested cleanup of availability older than {} days", daysOld);

        int deletedCount = maintenanceService.cleanupOldAvailability(daysOld);

        log.info("✅ Cleaned up {} old availability records", deletedCount);

        return ResponseEntity.ok(
            ApiResponse.success("Cleaned up " + deletedCount + " old records", deletedCount)
        );
    }

    /**
     * Get maintenance statistics
     * Shows counts of various records for monitoring
     *
     * @return Statistics object
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getMaintenanceStats() {

        log.info("📊 Admin requested maintenance statistics");

        var stats = maintenanceService.getMaintenanceStats();

        return ResponseEntity.ok(
            ApiResponse.success("Maintenance statistics retrieved", stats)
        );
    }
}

