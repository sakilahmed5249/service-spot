package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.repository.SpecificAvailabilityRepository;
import Team.C.Service.Spot.repository.BookingRepository;
import Team.C.Service.Spot.repository.ServiceListingRepository;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Maintenance Service Implementation
 * Handles database cleanup and maintenance operations
 *
 * @author Team C - Backend Lead
 * @version 1.0
 * @since 2025-11-30
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceServiceImpl implements MaintenanceService {

    private final SpecificAvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;
    private final ServiceListingRepository serviceListingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public int deleteAvailabilityByDate(LocalDate date) {
        log.warn("🗑️ Deleting all availability for date: {}", date);

        // This uses JPA's delete method - no safe mode issues!
        var availabilities = availabilityRepository.findAll().stream()
                .filter(a -> a.getAvailableDate().equals(date))
                .toList();

        int count = availabilities.size();

        if (count > 0) {
            availabilityRepository.deleteAll(availabilities);
            log.info("✅ Deleted {} availability records for {}", count, date);
        } else {
            log.info("ℹ️ No availability found for {}", date);
        }

        return count;
    }

    @Override
    @Transactional
    public int cleanupOldAvailability(int daysOld) {
        LocalDate cutoffDate = LocalDate.now().minusDays(daysOld);

        log.warn("🗑️ Cleaning up availability older than {} (before {})", daysOld + " days", cutoffDate);

        var oldAvailabilities = availabilityRepository.findAll().stream()
                .filter(a -> a.getAvailableDate().isBefore(cutoffDate))
                .toList();

        int count = oldAvailabilities.size();

        if (count > 0) {
            availabilityRepository.deleteAll(oldAvailabilities);
            log.info("✅ Cleaned up {} old availability records", count);
        } else {
            log.info("ℹ️ No old availability to clean up");
        }

        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getMaintenanceStats() {
        log.info("📊 Gathering maintenance statistics");

        Map<String, Object> stats = new HashMap<>();

        // Count records
        stats.put("totalAvailability", availabilityRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalServices", serviceListingRepository.count());
        stats.put("totalUsers", userRepository.count());

        // Count future availability
        long futureAvailability = availabilityRepository.findAll().stream()
                .filter(a -> !a.getAvailableDate().isBefore(LocalDate.now()))
                .count();
        stats.put("futureAvailability", futureAvailability);

        // Count past availability (can be cleaned up)
        long pastAvailability = availabilityRepository.findAll().stream()
                .filter(a -> a.getAvailableDate().isBefore(LocalDate.now()))
                .count();
        stats.put("pastAvailability", pastAvailability);

        log.info("📊 Statistics: {}", stats);

        return stats;
    }
}

