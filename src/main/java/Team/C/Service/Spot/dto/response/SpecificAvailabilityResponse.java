package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * DTO for specific availability response
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecificAvailabilityResponse {

    private Long id;
    private Long providerId;
    private String providerName;
    private Long serviceListingId;
    private String serviceTitle;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
    private Integer maxBookings;
    private Integer currentBookings;
    private Integer availableSlots; // maxBookings - currentBookings
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

