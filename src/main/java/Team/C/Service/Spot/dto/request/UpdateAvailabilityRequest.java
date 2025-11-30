package Team.C.Service.Spot.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * DTO for updating availability slots.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAvailabilityRequest {

    private LocalTime startTime;

    private LocalTime endTime;

    private Boolean isAvailable;

    @Min(value = 1, message = "Max bookings must be at least 1")
    private Integer maxBookings;

    @Min(value = 0, message = "Break duration cannot be negative")
    private Integer breakDuration;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}

