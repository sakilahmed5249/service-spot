package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import Team.C.Service.Spot.model.enums.DayOfWeek;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for availability responses.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityResponse {

    private Long id;
    private Long providerId;
    private String providerName;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
    private Integer maxBookings;
    private Integer currentBookings;
    private Integer availableSlots;
    private Integer breakDuration;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

