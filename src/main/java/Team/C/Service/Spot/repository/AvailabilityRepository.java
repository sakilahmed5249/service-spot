package Team.C.Service.Spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import Team.C.Service.Spot.model.Availability;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.DayOfWeek;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Availability entity operations.
 * Provides CRUD and custom query methods for availability management.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    /**
     * Find all availability slots for a provider
     */
    List<Availability> findByProvider(User provider);

    /**
     * Find availability by provider and day of week
     */
    List<Availability> findByProviderAndDayOfWeek(User provider, DayOfWeek dayOfWeek);

    /**
     * Find available slots for a provider on a specific day
     */
    List<Availability> findByProviderAndDayOfWeekAndIsAvailable(
        User provider,
        DayOfWeek dayOfWeek,
        Boolean isAvailable
    );

    /**
     * Find specific time slot
     */
    Optional<Availability> findByProviderAndDayOfWeekAndStartTime(
        User provider,
        DayOfWeek dayOfWeek,
        LocalTime startTime
    );

    /**
     * Check if time slot exists
     */
    boolean existsByProviderAndDayOfWeekAndStartTime(
        User provider,
        DayOfWeek dayOfWeek,
        LocalTime startTime
    );

    /**
     * Find overlapping time slots
     */
    @Query("SELECT a FROM Availability a WHERE a.provider = :provider " +
           "AND a.dayOfWeek = :dayOfWeek " +
           "AND ((a.startTime < :endTime AND a.endTime > :startTime))")
    List<Availability> findOverlappingSlots(
        @Param("provider") User provider,
        @Param("dayOfWeek") DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    /**
     * Find fully booked slots for a provider
     */
    @Query("SELECT a FROM Availability a WHERE a.provider = :provider " +
           "AND a.currentBookings >= a.maxBookings")
    List<Availability> findFullyBookedSlots(@Param("provider") User provider);

    /**
     * Find available slots with capacity
     */
    @Query("SELECT a FROM Availability a WHERE a.provider = :provider " +
           "AND a.isAvailable = true " +
           "AND a.currentBookings < a.maxBookings " +
           "ORDER BY a.dayOfWeek, a.startTime")
    List<Availability> findAvailableSlotsWithCapacity(@Param("provider") User provider);

    /**
     * Find slots for a specific day that have capacity
     */
    @Query("SELECT a FROM Availability a WHERE a.provider = :provider " +
           "AND a.dayOfWeek = :dayOfWeek " +
           "AND a.isAvailable = true " +
           "AND a.currentBookings < a.maxBookings " +
           "ORDER BY a.startTime")
    List<Availability> findAvailableSlotsByDay(
        @Param("provider") User provider,
        @Param("dayOfWeek") DayOfWeek dayOfWeek
    );

    /**
     * Count total availability slots for provider
     */
    long countByProvider(User provider);

    /**
     * Count available slots for provider
     */
    long countByProviderAndIsAvailable(User provider, Boolean isAvailable);

    /**
     * Delete all availability for a provider
     */
    void deleteByProvider(User provider);

    /**
     * Delete availability for a specific day
     */
    void deleteByProviderAndDayOfWeek(User provider, DayOfWeek dayOfWeek);
}

