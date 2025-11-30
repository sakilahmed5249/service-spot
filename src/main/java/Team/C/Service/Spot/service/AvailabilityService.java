package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.request.CreateAvailabilityRequest;
import Team.C.Service.Spot.dto.request.UpdateAvailabilityRequest;
import Team.C.Service.Spot.dto.response.AvailabilityResponse;
import Team.C.Service.Spot.model.enums.DayOfWeek;

import java.time.LocalTime;
import java.util.List;

/**
 * Service interface for Availability operations.
 * Handles provider availability management and slot booking.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
public interface AvailabilityService {

    /**
     * Create new availability slot
     */
    AvailabilityResponse createAvailability(CreateAvailabilityRequest request);

    /**
     * Get availability by ID
     */
    AvailabilityResponse getAvailabilityById(Long id);

    /**
     * Get all availability slots for a provider
     */
    List<AvailabilityResponse> getProviderAvailability(Long providerId);

    /**
     * Get availability for a specific day
     */
    List<AvailabilityResponse> getAvailabilityByDay(Long providerId, DayOfWeek dayOfWeek);

    /**
     * Get available slots (not fully booked) for a provider
     */
    List<AvailabilityResponse> getAvailableSlots(Long providerId);

    /**
     * Get available slots for a specific day
     */
    List<AvailabilityResponse> getAvailableSlotsByDay(Long providerId, DayOfWeek dayOfWeek);

    /**
     * Check if time slot is available
     */
    boolean isSlotAvailable(Long providerId, DayOfWeek dayOfWeek, LocalTime startTime);

    /**
     * Update availability slot
     */
    AvailabilityResponse updateAvailability(Long id, UpdateAvailabilityRequest request);

    /**
     * Delete availability slot
     */
    void deleteAvailability(Long id);

    /**
     * Delete all availability for a provider
     */
    void deleteProviderAvailability(Long providerId);

    /**
     * Increment booking count for a slot (when booking created)
     */
    void incrementSlotBooking(Long availabilityId);

    /**
     * Decrement booking count for a slot (when booking cancelled)
     */
    void decrementSlotBooking(Long availabilityId);

    /**
     * Check for overlapping time slots
     */
    boolean hasOverlappingSlots(Long providerId, DayOfWeek dayOfWeek,
                                LocalTime startTime, LocalTime endTime);
}

