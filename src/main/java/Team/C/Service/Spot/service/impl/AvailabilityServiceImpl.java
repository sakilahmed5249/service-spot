package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.request.CreateAvailabilityRequest;
import Team.C.Service.Spot.dto.request.UpdateAvailabilityRequest;
import Team.C.Service.Spot.dto.response.AvailabilityResponse;
import Team.C.Service.Spot.mapper.AvailabilityMapper;
import Team.C.Service.Spot.model.Availability;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.DayOfWeek;
import Team.C.Service.Spot.repository.AvailabilityRepository;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of AvailabilityService.
 * Handles all availability management and slot booking logic.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    private final AvailabilityMapper availabilityMapper;

    @Override
    public AvailabilityResponse createAvailability(CreateAvailabilityRequest request) {
        log.info("Creating availability for provider {} on {}",
                request.getProviderId(), request.getDayOfWeek());

        // Validate provider
        User provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + request.getProviderId()));

        // Validate times
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for existing slot at same time
        if (availabilityRepository.existsByProviderAndDayOfWeekAndStartTime(
                provider, request.getDayOfWeek(), request.getStartTime())) {
            throw new IllegalStateException(
                    "Availability slot already exists for this time");
        }

        // Check for overlapping slots
        List<Availability> overlapping = availabilityRepository.findOverlappingSlots(
                provider, request.getDayOfWeek(),
                request.getStartTime(), request.getEndTime());

        if (!overlapping.isEmpty()) {
            throw new IllegalStateException(
                    "This time slot overlaps with existing availability");
        }

        // Create availability
        Availability availability = Availability.builder()
                .provider(provider)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .maxBookings(request.getMaxBookings() != null ? request.getMaxBookings() : 1)
                .currentBookings(0)
                .breakDuration(request.getBreakDuration())
                .notes(request.getNotes())
                .build();

        Availability saved = availabilityRepository.save(availability);
        log.info("Availability created with ID: {}", saved.getId());

        return availabilityMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailabilityById(Long id) {
        log.info("Fetching availability with ID: {}", id);

        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Availability not found with ID: " + id));

        return availabilityMapper.toResponse(availability);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getProviderAvailability(Long providerId) {
        log.info("Fetching availability for provider {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Availability> availabilities = availabilityRepository.findByProvider(provider);

        return availabilities.stream()
                .map(availabilityMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailabilityByDay(Long providerId, DayOfWeek dayOfWeek) {
        log.info("Fetching availability for provider {} on {}", providerId, dayOfWeek);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Availability> availabilities = availabilityRepository
                .findByProviderAndDayOfWeek(provider, dayOfWeek);

        return availabilities.stream()
                .map(availabilityMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailableSlots(Long providerId) {
        log.info("Fetching available slots for provider {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Availability> availabilities = availabilityRepository
                .findAvailableSlotsWithCapacity(provider);

        return availabilities.stream()
                .map(availabilityMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailableSlotsByDay(Long providerId, DayOfWeek dayOfWeek) {
        log.info("Fetching available slots for provider {} on {}", providerId, dayOfWeek);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Availability> availabilities = availabilityRepository
                .findAvailableSlotsByDay(provider, dayOfWeek);

        return availabilities.stream()
                .map(availabilityMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSlotAvailable(Long providerId, DayOfWeek dayOfWeek, LocalTime startTime) {
        log.info("Checking if slot is available: provider={}, day={}, time={}",
                providerId, dayOfWeek, startTime);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        return availabilityRepository.findByProviderAndDayOfWeekAndStartTime(
                provider, dayOfWeek, startTime)
                .map(Availability::canAcceptBooking)
                .orElse(false);
    }

    @Override
    public AvailabilityResponse updateAvailability(Long id, UpdateAvailabilityRequest request) {
        log.info("Updating availability {}", id);

        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Availability not found with ID: " + id));

        // Update fields if provided
        if (request.getStartTime() != null) {
            availability.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            availability.setEndTime(request.getEndTime());
        }
        if (request.getIsAvailable() != null) {
            availability.setIsAvailable(request.getIsAvailable());
        }
        if (request.getMaxBookings() != null) {
            availability.setMaxBookings(request.getMaxBookings());
        }
        if (request.getBreakDuration() != null) {
            availability.setBreakDuration(request.getBreakDuration());
        }
        if (request.getNotes() != null) {
            availability.setNotes(request.getNotes());
        }

        // Validate times if both are set
        if (availability.getEndTime().isBefore(availability.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Availability updated = availabilityRepository.save(availability);
        log.info("Availability {} updated successfully", id);

        return availabilityMapper.toResponse(updated);
    }

    @Override
    public void deleteAvailability(Long id) {
        log.info("Deleting availability {}", id);

        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Availability not found with ID: " + id));

        // Check if slot has bookings
        if (availability.getCurrentBookings() > 0) {
            throw new IllegalStateException(
                    "Cannot delete availability slot with active bookings");
        }

        availabilityRepository.delete(availability);
        log.info("Availability {} deleted successfully", id);
    }

    @Override
    public void deleteProviderAvailability(Long providerId) {
        log.info("Deleting all availability for provider {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Availability> availabilities = availabilityRepository.findByProvider(provider);

        // Check for active bookings
        boolean hasBookings = availabilities.stream()
                .anyMatch(a -> a.getCurrentBookings() > 0);

        if (hasBookings) {
            throw new IllegalStateException(
                    "Cannot delete availability with active bookings");
        }

        availabilityRepository.deleteByProvider(provider);
        log.info("All availability deleted for provider {}", providerId);
    }

    @Override
    public void incrementSlotBooking(Long availabilityId) {
        log.info("Incrementing booking count for availability {}", availabilityId);

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Availability not found with ID: " + availabilityId));

        if (!availability.canAcceptBooking()) {
            throw new IllegalStateException("Availability slot is fully booked");
        }

        availability.incrementBookingCount();
        availabilityRepository.save(availability);

        log.info("Booking count incremented: {}/{}",
                availability.getCurrentBookings(), availability.getMaxBookings());
    }

    @Override
    public void decrementSlotBooking(Long availabilityId) {
        log.info("Decrementing booking count for availability {}", availabilityId);

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Availability not found with ID: " + availabilityId));

        availability.decrementBookingCount();
        availabilityRepository.save(availability);

        log.info("Booking count decremented: {}/{}",
                availability.getCurrentBookings(), availability.getMaxBookings());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasOverlappingSlots(Long providerId, DayOfWeek dayOfWeek,
                                      LocalTime startTime, LocalTime endTime) {
        log.info("Checking for overlapping slots: provider={}, day={}, time={}-{}",
                providerId, dayOfWeek, startTime, endTime);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Availability> overlapping = availabilityRepository.findOverlappingSlots(
                provider, dayOfWeek, startTime, endTime);

        return !overlapping.isEmpty();
    }
}

