package Team.C.Service.Spot.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import Team.C.Service.Spot.model.enums.DayOfWeek;

import java.time.LocalTime;

/**
 * DTO for creating availability slots.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAvailabilityRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    @Min(value = 1, message = "Max bookings must be at least 1")
    private Integer maxBookings = 1;

    @Min(value = 0, message = "Break duration cannot be negative")
    private Integer breakDuration;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}

