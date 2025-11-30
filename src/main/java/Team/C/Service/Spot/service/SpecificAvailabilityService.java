package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.request.CreateSpecificAvailabilityRequest;
import Team.C.Service.Spot.dto.response.SpecificAvailabilityResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for SpecificAvailability operations.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
public interface SpecificAvailabilityService {

    /**
     * Create new specific availability slot
     */
    SpecificAvailabilityResponse createAvailability(CreateSpecificAvailabilityRequest request);

    /**
     * Get availability by ID
     */
    SpecificAvailabilityResponse getAvailabilityById(Long id);

    /**
     * Get all availability for a provider
     */
    List<SpecificAvailabilityResponse> getProviderAvailability(Long providerId);

    /**
     * Get future availability for a provider
     */
    List<SpecificAvailabilityResponse> getProviderFutureAvailability(Long providerId);

    /**
     * Get availability for a service listing
     */
    List<SpecificAvailabilityResponse> getServiceAvailability(Long serviceListingId);

    /**
     * Get future availability for a service listing
     */
    List<SpecificAvailabilityResponse> getServiceFutureAvailability(Long serviceListingId);

    /**
     * Get available dates for a provider in a date range
     */
    List<LocalDate> getAvailableDates(Long providerId, LocalDate startDate, LocalDate endDate);

    /**
     * Get available dates for a service in a date range
     */
    List<LocalDate> getAvailableDatesForService(Long serviceListingId, LocalDate startDate, LocalDate endDate);

    /**
     * Get time slots for a specific date
     */
    List<SpecificAvailabilityResponse> getTimeSlotsForDate(Long providerId, LocalDate date);

    /**
     * Get time slots for a specific date and service
     */
    List<SpecificAvailabilityResponse> getTimeSlotsForDateAndService(Long serviceListingId, LocalDate date);

    /**
     * Update availability
     */
    SpecificAvailabilityResponse updateAvailability(Long id, CreateSpecificAvailabilityRequest request);

    /**
     * Delete availability
     */
    void deleteAvailability(Long id);

    /**
     * Mark availability as unavailable
     */
    SpecificAvailabilityResponse markAsUnavailable(Long id);

    /**
     * Mark availability as available
     */
    SpecificAvailabilityResponse markAsAvailable(Long id);

    /**
     * Increment booking count for a slot
     */
    void incrementBookingCount(Long availabilityId);

    /**
     * Decrement booking count for a slot
     */
    void decrementBookingCount(Long availabilityId);
}

