package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.request.CreateAvailabilityRequest;
import Team.C.Service.Spot.dto.request.UpdateAvailabilityRequest;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.AvailabilityResponse;
import Team.C.Service.Spot.model.enums.DayOfWeek;
import Team.C.Service.Spot.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

/**
 * REST Controller for Availability operations.
 * Handles provider availability management and slot booking.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Slf4j
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    /**
     * Create new availability slot
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AvailabilityResponse>> createAvailability(
            @Valid @RequestBody CreateAvailabilityRequest request) {
        AvailabilityResponse availability = availabilityService.createAvailability(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Availability created successfully", availability));
    }

    /**
     * Get availability by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> getAvailabilityById(
            @PathVariable Long id) {
        AvailabilityResponse availability = availabilityService.getAvailabilityById(id);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availability));
    }

    /**
     * Get all availability for a provider
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> getProviderAvailability(
            @PathVariable Long providerId) {
        List<AvailabilityResponse> availabilities = availabilityService.getProviderAvailability(providerId);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availabilities));
    }

    /**
     * Get availability for specific day
     */
    @GetMapping("/provider/{providerId}/day/{dayOfWeek}")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> getAvailabilityByDay(
            @PathVariable Long providerId,
            @PathVariable DayOfWeek dayOfWeek) {
        List<AvailabilityResponse> availabilities =
                availabilityService.getAvailabilityByDay(providerId, dayOfWeek);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availabilities));
    }

    /**
     * Get available slots (not fully booked)
     */
    @GetMapping("/provider/{providerId}/available")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> getAvailableSlots(
            @PathVariable Long providerId) {
        List<AvailabilityResponse> availabilities = availabilityService.getAvailableSlots(providerId);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved successfully", availabilities));
    }

    /**
     * Get available slots for specific day
     */
    @GetMapping("/provider/{providerId}/available/day/{dayOfWeek}")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> getAvailableSlotsByDay(
            @PathVariable Long providerId,
            @PathVariable DayOfWeek dayOfWeek) {
        List<AvailabilityResponse> availabilities =
                availabilityService.getAvailableSlotsByDay(providerId, dayOfWeek);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved successfully", availabilities));
    }

    /**
     * Check if slot is available
     */
    @GetMapping("/provider/{providerId}/check")
    public ResponseEntity<ApiResponse<Boolean>> isSlotAvailable(
            @PathVariable Long providerId,
            @RequestParam DayOfWeek dayOfWeek,
            @RequestParam LocalTime startTime) {
        boolean available = availabilityService.isSlotAvailable(providerId, dayOfWeek, startTime);
        return ResponseEntity.ok(ApiResponse.success("Availability check completed", available));
    }

    /**
     * Update availability slot
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAvailabilityRequest request) {
        AvailabilityResponse availability = availabilityService.updateAvailability(id, request);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", availability));
    }

    /**
     * Delete availability slot
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.ok(ApiResponse.success("Availability deleted successfully", "Deleted"));
    }

    /**
     * Delete all availability for a provider
     */
    @DeleteMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<String>> deleteProviderAvailability(
            @PathVariable Long providerId) {
        availabilityService.deleteProviderAvailability(providerId);
        return ResponseEntity.ok(ApiResponse.success("All availability deleted successfully", "Deleted"));
    }

    /**
     * Check for overlapping slots
     */
    @GetMapping("/provider/{providerId}/overlap-check")
    public ResponseEntity<ApiResponse<Boolean>> hasOverlappingSlots(
            @PathVariable Long providerId,
            @RequestParam DayOfWeek dayOfWeek,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime) {
        boolean hasOverlap = availabilityService.hasOverlappingSlots(
                providerId, dayOfWeek, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success("Overlap check completed", hasOverlap));
    }
}

