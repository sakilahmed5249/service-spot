package Team.C.Service.Spot.service;

import java.time.LocalDate;
import java.util.Map;

/**
 * Maintenance Service Interface
 * Provides database cleanup and maintenance operations
 *
 * @author Team C - Backend Lead
 * @version 1.0
 * @since 2025-11-30
 */
public interface MaintenanceService {

    /**
     * Delete all availability records for a specific date
     *
     * @param date The date to delete
     * @return Number of records deleted
     */
    int deleteAvailabilityByDate(LocalDate date);

    /**
     * Clean up old availability records
     *
     * @param daysOld Delete records older than this many days
     * @return Number of records deleted
     */
    int cleanupOldAvailability(int daysOld);

    /**
     * Get maintenance statistics
     *
     * @return Map with various statistics
     */
    Map<String, Object> getMaintenanceStats();
}

