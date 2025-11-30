package Team.C.Service.Spot.mapper;

import Team.C.Service.Spot.dto.response.SpecificAvailabilityResponse;
import Team.C.Service.Spot.model.SpecificAvailability;
import org.springframework.stereotype.Component;

/**
 * Mapper for SpecificAvailability entity and DTOs
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
@Component
public class SpecificAvailabilityMapper {

    public SpecificAvailabilityResponse toResponse(SpecificAvailability entity) {
        if (entity == null) {
            return null;
        }

        Integer availableSlots = null;
        if (entity.getMaxBookings() != null && entity.getCurrentBookings() != null) {
            availableSlots = Math.max(0, entity.getMaxBookings() - entity.getCurrentBookings());
        }

        return SpecificAvailabilityResponse.builder()
                .id(entity.getId())
                .providerId(entity.getProvider() != null ? entity.getProvider().getId() : null)
                .providerName(entity.getProvider() != null ? entity.getProvider().getName() : null)
                .serviceListingId(entity.getServiceListing() != null ? entity.getServiceListing().getId() : null)
                .serviceTitle(entity.getServiceListing() != null ? entity.getServiceListing().getTitle() : null)
                .availableDate(entity.getAvailableDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .isAvailable(entity.getIsAvailable())
                .maxBookings(entity.getMaxBookings())
                .currentBookings(entity.getCurrentBookings())
                .availableSlots(availableSlots)
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

