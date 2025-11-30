package Team.C.Service.Spot.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for creating specific availability slots
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSpecificAvailabilityRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    private Long serviceListingId; // Optional - if null, applies to all services

    @NotNull(message = "Available date is required")
    @Future(message = "Available date must be in the future")
    private LocalDate availableDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Integer maxBookings; // Optional - if null, unlimited

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
}

