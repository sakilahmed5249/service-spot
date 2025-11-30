package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.request.CreateSpecificAvailabilityRequest;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.SpecificAvailabilityResponse;
import Team.C.Service.Spot.service.SpecificAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Specific Availability operations.
 * Handles provider-specific date/time availability management.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
@RestController
@RequestMapping("/api/specific-availability")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Slf4j
public class SpecificAvailabilityController {

    private final SpecificAvailabilityService availabilityService;

    /**
     * Create new specific availability slot
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SpecificAvailabilityResponse>> createAvailability(
            @Valid @RequestBody CreateSpecificAvailabilityRequest request) {
        SpecificAvailabilityResponse availability = availabilityService.createAvailability(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Availability created successfully", availability));
    }

    /**
     * Get availability by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecificAvailabilityResponse>> getAvailabilityById(
            @PathVariable Long id) {
        SpecificAvailabilityResponse availability = availabilityService.getAvailabilityById(id);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availability));
    }

    /**
     * Get all future availability for a provider
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<SpecificAvailabilityResponse>>> getProviderAvailability(
            @PathVariable Long providerId,
            @RequestParam(required = false, defaultValue = "true") boolean futureOnly) {

        List<SpecificAvailabilityResponse> availabilities = futureOnly
                ? availabilityService.getProviderFutureAvailability(providerId)
                : availabilityService.getProviderAvailability(providerId);

        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availabilities));
    }

    /**
     * Get all future availability for a service
     */
    @GetMapping("/service/{serviceListingId}")
    public ResponseEntity<ApiResponse<List<SpecificAvailabilityResponse>>> getServiceAvailability(
            @PathVariable Long serviceListingId,
            @RequestParam(required = false, defaultValue = "true") boolean futureOnly) {

        List<SpecificAvailabilityResponse> availabilities = futureOnly
                ? availabilityService.getServiceFutureAvailability(serviceListingId)
                : availabilityService.getServiceAvailability(serviceListingId);

        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availabilities));
    }

    /**
     * Get available dates for a provider in a date range
     * No caching to ensure fresh availability data after bookings
     */
    @GetMapping("/provider/{providerId}/dates")
    public ResponseEntity<ApiResponse<List<LocalDate>>> getAvailableDates(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("📅 Fetching available dates for provider {} from {} to {}", providerId, startDate, endDate);
        List<LocalDate> dates = availabilityService.getAvailableDates(providerId, startDate, endDate);
        log.info("✅ Returning {} available dates", dates.size());

        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.noCache().noStore())
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(ApiResponse.success("Available dates retrieved successfully", dates));
    }

    /**
     * Get available dates for a service in a date range
     */
    @GetMapping("/service/{serviceListingId}/dates")
    public ResponseEntity<ApiResponse<List<LocalDate>>> getAvailableDatesForService(
            @PathVariable Long serviceListingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<LocalDate> dates = availabilityService.getAvailableDatesForService(serviceListingId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Available dates retrieved successfully", dates));
    }

    /**
     * Get time slots for a specific date
     * No caching to ensure real-time slot availability after bookings
     */
    @GetMapping("/provider/{providerId}/slots")
    public ResponseEntity<ApiResponse<List<SpecificAvailabilityResponse>>> getTimeSlotsForDate(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        log.info("🕐 Fetching time slots for provider {} on {}", providerId, date);
        List<SpecificAvailabilityResponse> slots = availabilityService.getTimeSlotsForDate(providerId, date);
        log.info("✅ Returning {} time slots", slots.size());

        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.noCache().noStore())
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(ApiResponse.success("Time slots retrieved successfully", slots));
    }

    /**
     * Get time slots for a specific date and service
     */
    @GetMapping("/service/{serviceListingId}/slots")
    public ResponseEntity<ApiResponse<List<SpecificAvailabilityResponse>>> getTimeSlotsForDateAndService(
            @PathVariable Long serviceListingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<SpecificAvailabilityResponse> slots = availabilityService.getTimeSlotsForDateAndService(serviceListingId, date);
        return ResponseEntity.ok(ApiResponse.success("Time slots retrieved successfully", slots));
    }

    /**
     * Update availability
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecificAvailabilityResponse>> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody CreateSpecificAvailabilityRequest request) {

        SpecificAvailabilityResponse availability = availabilityService.updateAvailability(id, request);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", availability));
    }

    /**
     * Delete availability
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.ok(ApiResponse.success("Availability deleted successfully", null));
    }

    /**
     * Mark availability as unavailable
     */
    @PatchMapping("/{id}/unavailable")
    public ResponseEntity<ApiResponse<SpecificAvailabilityResponse>> markAsUnavailable(@PathVariable Long id) {
        SpecificAvailabilityResponse availability = availabilityService.markAsUnavailable(id);
        return ResponseEntity.ok(ApiResponse.success("Availability marked as unavailable", availability));
    }

    /**
     * Mark availability as available
     */
    @PatchMapping("/{id}/available")
    public ResponseEntity<ApiResponse<SpecificAvailabilityResponse>> markAsAvailable(@PathVariable Long id) {
        SpecificAvailabilityResponse availability = availabilityService.markAsAvailable(id);
        return ResponseEntity.ok(ApiResponse.success("Availability marked as available", availability));
    }
}

