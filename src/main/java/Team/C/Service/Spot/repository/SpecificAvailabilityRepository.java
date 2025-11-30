package Team.C.Service.Spot.repository;

import Team.C.Service.Spot.model.SpecificAvailability;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.ServiceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for SpecificAvailability entity.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
@Repository
public interface SpecificAvailabilityRepository extends JpaRepository<SpecificAvailability, Long> {

    /**
     * Find all availability for a provider
     */
    List<SpecificAvailability> findByProvider(User provider);

    /**
     * Find all availability for a provider on or after a specific date
     */
    List<SpecificAvailability> findByProviderAndAvailableDateGreaterThanEqualOrderByAvailableDateAscStartTimeAsc(
            User provider, LocalDate date);

    /**
     * Find all availability for a service listing
     */
    List<SpecificAvailability> findByServiceListing(ServiceListing serviceListing);

    /**
     * Find all availability for a service listing on or after a specific date
     */
    List<SpecificAvailability> findByServiceListingAndAvailableDateGreaterThanEqualOrderByAvailableDateAscStartTimeAsc(
            ServiceListing serviceListing, LocalDate date);

    /**
     * Find availability for a provider on a specific date
     */
    List<SpecificAvailability> findByProviderAndAvailableDate(User provider, LocalDate date);

    /**
     * Find availability for a service on a specific date
     */
    List<SpecificAvailability> findByServiceListingAndAvailableDate(ServiceListing serviceListing, LocalDate date);

    /**
     * Find available slots for a provider between dates
     * Only returns slots that are:
     * - marked as available (isAvailable = true)
     * - have capacity (currentBookings < maxBookings OR maxBookings is null)
     * - in the future or today
     */
    @Query("SELECT sa FROM SpecificAvailability sa WHERE sa.provider = :provider " +
           "AND sa.availableDate BETWEEN :startDate AND :endDate " +
           "AND sa.availableDate >= CURRENT_DATE " +
           "AND sa.isAvailable = true " +
           "AND (sa.maxBookings IS NULL OR sa.currentBookings < sa.maxBookings) " +
           "ORDER BY sa.availableDate ASC, sa.startTime ASC")
    List<SpecificAvailability> findAvailableSlotsByProviderAndDateRange(
            @Param("provider") User provider,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find available slots for a service between dates
     * Only returns slots that are:
     * - marked as available (isAvailable = true)
     * - have capacity (currentBookings < maxBookings OR maxBookings is null)
     * - in the future or today
     */
    @Query("SELECT sa FROM SpecificAvailability sa WHERE sa.serviceListing = :service " +
           "AND sa.availableDate BETWEEN :startDate AND :endDate " +
           "AND sa.availableDate >= CURRENT_DATE " +
           "AND sa.isAvailable = true " +
           "AND (sa.maxBookings IS NULL OR sa.currentBookings < sa.maxBookings) " +
           "ORDER BY sa.availableDate ASC, sa.startTime ASC")
    List<SpecificAvailability> findAvailableSlotsByServiceAndDateRange(
            @Param("service") ServiceListing service,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find specific availability slot
     */
    Optional<SpecificAvailability> findByProviderAndAvailableDateAndStartTime(
            User provider, LocalDate date, LocalTime startTime);

    /**
     * Check if slot exists
     */
    boolean existsByProviderAndAvailableDateAndStartTime(
            User provider, LocalDate date, LocalTime startTime);

    /**
     * Delete all availability for a provider after a specific date
     */
    void deleteByProviderAndAvailableDateGreaterThan(User provider, LocalDate date);

    /**
     * Delete all past availability (cleanup)
     */
    void deleteByAvailableDateLessThan(LocalDate date);
}

