package Team.C.Service.Spot.mapper;

import Team.C.Service.Spot.dto.response.AvailabilityResponse;
import Team.C.Service.Spot.model.Availability;
import org.springframework.stereotype.Component;

/**
 * Mapper for Availability entity and DTOs.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Component
public class AvailabilityMapper {

    public AvailabilityResponse toResponse(Availability availability) {
        if (availability == null) {
            return null;
        }

        Integer availableSlots = availability.getMaxBookings() - availability.getCurrentBookings();

        return AvailabilityResponse.builder()
                .id(availability.getId())
                .providerId(availability.getProvider().getId())
                .providerName(availability.getProvider().getName())
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .isAvailable(availability.getIsAvailable())
                .maxBookings(availability.getMaxBookings())
                .currentBookings(availability.getCurrentBookings())
                .availableSlots(availableSlots >= 0 ? availableSlots : 0)
                .breakDuration(availability.getBreakDuration())
                .notes(availability.getNotes())
                .createdAt(availability.getCreatedAt())
                .updatedAt(availability.getUpdatedAt())
                .build();
    }
}

