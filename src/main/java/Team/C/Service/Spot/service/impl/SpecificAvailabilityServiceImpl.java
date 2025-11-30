package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.request.CreateSpecificAvailabilityRequest;
import Team.C.Service.Spot.dto.response.SpecificAvailabilityResponse;
import Team.C.Service.Spot.mapper.SpecificAvailabilityMapper;
import Team.C.Service.Spot.model.ServiceListing;
import Team.C.Service.Spot.model.SpecificAvailability;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.repository.ServiceListingRepository;
import Team.C.Service.Spot.repository.SpecificAvailabilityRepository;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.SpecificAvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of SpecificAvailabilityService
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SpecificAvailabilityServiceImpl implements SpecificAvailabilityService {

    private final SpecificAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    private final ServiceListingRepository serviceListingRepository;
    private final SpecificAvailabilityMapper mapper;

    @Override
    public SpecificAvailabilityResponse createAvailability(CreateSpecificAvailabilityRequest request) {
        log.info("Creating specific availability for provider ID: {}", request.getProviderId());

        // Validate provider
        User provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + request.getProviderId()));

        // Validate service if provided
        ServiceListing service = null;
        if (request.getServiceListingId() != null) {
            service = serviceListingRepository.findById(request.getServiceListingId())
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + request.getServiceListingId()));

            // Ensure service belongs to provider
            if (!service.getProvider().getId().equals(provider.getId())) {
                throw new IllegalArgumentException("Service does not belong to this provider");
            }
        }

        // Validate times
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Check for overlapping slots
        List<SpecificAvailability> existingSlots = availabilityRepository
                .findByProviderAndAvailableDate(provider, request.getAvailableDate());

        for (SpecificAvailability existing : existingSlots) {
            if (timeSlotsOverlap(request.getStartTime(), request.getEndTime(),
                                existing.getStartTime(), existing.getEndTime())) {
                throw new IllegalArgumentException("Time slot overlaps with existing availability");
            }
        }

        // Create availability
        SpecificAvailability availability = SpecificAvailability.builder()
                .provider(provider)
                .serviceListing(service)
                .availableDate(request.getAvailableDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .maxBookings(request.getMaxBookings())
                .currentBookings(0)
                .isAvailable(true)
                .notes(request.getNotes())
                .build();

        SpecificAvailability saved = availabilityRepository.save(availability);
        log.info("Created specific availability with ID: {}", saved.getId());

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SpecificAvailabilityResponse getAvailabilityById(Long id) {
        SpecificAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + id));
        return mapper.toResponse(availability);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificAvailabilityResponse> getProviderAvailability(Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + providerId));

        List<SpecificAvailability> availabilities = availabilityRepository.findByProvider(provider);
        return availabilities.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificAvailabilityResponse> getProviderFutureAvailability(Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + providerId));

        List<SpecificAvailability> availabilities = availabilityRepository
                .findByProviderAndAvailableDateGreaterThanEqualOrderByAvailableDateAscStartTimeAsc(
                        provider, LocalDate.now());

        return availabilities.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificAvailabilityResponse> getServiceAvailability(Long serviceListingId) {
        ServiceListing service = serviceListingRepository.findById(serviceListingId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceListingId));

        List<SpecificAvailability> availabilities = availabilityRepository.findByServiceListing(service);
        return availabilities.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificAvailabilityResponse> getServiceFutureAvailability(Long serviceListingId) {
        ServiceListing service = serviceListingRepository.findById(serviceListingId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceListingId));

        List<SpecificAvailability> availabilities = availabilityRepository
                .findByServiceListingAndAvailableDateGreaterThanEqualOrderByAvailableDateAscStartTimeAsc(
                        service, LocalDate.now());

        return availabilities.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalDate> getAvailableDates(Long providerId, LocalDate startDate, LocalDate endDate) {
        log.info("=== GET AVAILABLE DATES REQUEST ===");
        log.info("Provider ID: {}", providerId);
        log.info("Start Date: {}", startDate);
        log.info("End Date: {}", endDate);
        log.info("Current Date: {}", LocalDate.now());

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + providerId));

        log.info("Provider found: {} ({})", provider.getName(), provider.getEmail());

        List<SpecificAvailability> slots = availabilityRepository
                .findAvailableSlotsByProviderAndDateRange(provider, startDate, endDate);

        log.info("Total slots found from repository: {}", slots.size());

        if (slots.isEmpty()) {
            log.warn("NO AVAILABILITY SLOTS FOUND for provider {} between {} and {}", providerId, startDate, endDate);
        } else {
            slots.forEach(slot -> {
                log.info("Slot found - Date: {}, Time: {}-{}, Available: {}, Bookings: {}/{}",
                    slot.getAvailableDate(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    slot.getIsAvailable(),
                    slot.getCurrentBookings(),
                    slot.getMaxBookings());
            });
        }

        List<LocalDate> dates = slots.stream()
                .map(SpecificAvailability::getAvailableDate)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        log.info("Distinct dates being returned: {}", dates);
        log.info("=== END GET AVAILABLE DATES ===");

        return dates;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalDate> getAvailableDatesForService(Long serviceListingId, LocalDate startDate, LocalDate endDate) {
        ServiceListing service = serviceListingRepository.findById(serviceListingId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceListingId));

        List<SpecificAvailability> slots = availabilityRepository
                .findAvailableSlotsByServiceAndDateRange(service, startDate, endDate);

        return slots.stream()
                .map(SpecificAvailability::getAvailableDate)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificAvailabilityResponse> getTimeSlotsForDate(Long providerId, LocalDate date) {
        log.info("=== GET TIME SLOTS FOR DATE REQUEST ===");
        log.info("Provider ID: {}", providerId);
        log.info("Requested Date: {}", date);
        log.info("Current Date: {}", LocalDate.now());

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + providerId));

        log.info("Provider found: {}", provider.getName());

        List<SpecificAvailability> slots = availabilityRepository
                .findByProviderAndAvailableDate(provider, date);

        log.info("Raw slots found: {}", slots.size());

        List<SpecificAvailabilityResponse> filteredSlots = slots.stream()
                .filter(slot -> {
                    boolean isAvailable = slot.getIsAvailable();
                    boolean hasCapacity = slot.getMaxBookings() == null || slot.getCurrentBookings() < slot.getMaxBookings();
                    boolean passes = isAvailable && hasCapacity;

                    log.info("Slot {}: Available={}, Capacity={}/{}, Passes={}",
                        slot.getId(), isAvailable, slot.getCurrentBookings(), slot.getMaxBookings(), passes);

                    return passes;
                })
                .map(mapper::toResponse)
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .collect(Collectors.toList());

        log.info("Filtered slots being returned: {}", filteredSlots.size());
        log.info("=== END GET TIME SLOTS ===");

        return filteredSlots;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecificAvailabilityResponse> getTimeSlotsForDateAndService(Long serviceListingId, LocalDate date) {
        ServiceListing service = serviceListingRepository.findById(serviceListingId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceListingId));

        List<SpecificAvailability> slots = availabilityRepository
                .findByServiceListingAndAvailableDate(service, date);

        return slots.stream()
                .filter(slot -> slot.getIsAvailable() &&
                        (slot.getMaxBookings() == null || slot.getCurrentBookings() < slot.getMaxBookings()))
                .map(mapper::toResponse)
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .collect(Collectors.toList());
    }

    @Override
    public SpecificAvailabilityResponse updateAvailability(Long id, CreateSpecificAvailabilityRequest request) {
        SpecificAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + id));

        // Update fields
        if (request.getAvailableDate() != null) {
            availability.setAvailableDate(request.getAvailableDate());
        }
        if (request.getStartTime() != null) {
            availability.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            availability.setEndTime(request.getEndTime());
        }
        if (request.getMaxBookings() != null) {
            availability.setMaxBookings(request.getMaxBookings());
        }
        if (request.getNotes() != null) {
            availability.setNotes(request.getNotes());
        }

        SpecificAvailability updated = availabilityRepository.save(availability);
        return mapper.toResponse(updated);
    }

    @Override
    public void deleteAvailability(Long id) {
        if (!availabilityRepository.existsById(id)) {
            throw new IllegalArgumentException("Availability not found with ID: " + id);
        }
        availabilityRepository.deleteById(id);
        log.info("Deleted availability with ID: {}", id);
    }

    @Override
    public SpecificAvailabilityResponse markAsUnavailable(Long id) {
        SpecificAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + id));

        availability.setIsAvailable(false);
        SpecificAvailability updated = availabilityRepository.save(availability);
        return mapper.toResponse(updated);
    }

    @Override
    public SpecificAvailabilityResponse markAsAvailable(Long id) {
        SpecificAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + id));

        availability.setIsAvailable(true);
        SpecificAvailability updated = availabilityRepository.save(availability);
        return mapper.toResponse(updated);
    }

    @Override
    public void incrementBookingCount(Long availabilityId) {
        SpecificAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + availabilityId));

        availability.incrementBookingCount();
        availabilityRepository.save(availability);
        log.info("Incremented booking count for availability ID: {}", availabilityId);
    }

    @Override
    public void decrementBookingCount(Long availabilityId) {
        SpecificAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + availabilityId));

        availability.decrementBookingCount();
        availabilityRepository.save(availability);
        log.info("Decremented booking count for availability ID: {}", availabilityId);
    }

    /**
     * Check if two time slots overlap
     */
    private boolean timeSlotsOverlap(java.time.LocalTime start1, java.time.LocalTime end1,
                                    java.time.LocalTime start2, java.time.LocalTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    /**
     * Scheduled task to automatically clean up past availability records.
     * Runs daily at 2 AM to remove all availability for dates before today.
     * This prevents stale data from accumulating in the database.
     */
    @Scheduled(cron = "0 0 2 * * *") // Run at 2:00 AM every day
    @Transactional
    public void cleanupPastAvailability() {
        LocalDate today = LocalDate.now();
        log.info("=== SCHEDULED CLEANUP: Removing past availability records before {} ===", today);

        try {
            // Count records before deletion
            long countBefore = availabilityRepository.count();

            // Delete all past availability
            availabilityRepository.deleteByAvailableDateLessThan(today);

            // Count after deletion
            long countAfter = availabilityRepository.count();
            long deleted = countBefore - countAfter;

            log.info("✅ Cleanup complete: Deleted {} past availability records", deleted);
            log.info("Remaining records in database: {}", countAfter);
        } catch (Exception e) {
            log.error("❌ Error during scheduled cleanup: {}", e.getMessage(), e);
        }
    }
}

