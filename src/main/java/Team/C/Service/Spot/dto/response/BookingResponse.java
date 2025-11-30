package Team.C.Service.Spot.dto.response;

import Team.C.Service.Spot.model.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for booking response.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private String bookingReference;

    // Booking details
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Integer durationMinutes;
    private BookingStatus status;

    // Location
    private String serviceDoorNo;
    private String serviceAddressLine;
    private String serviceCity;
    private String serviceState;
    private Integer servicePincode;
    private String fullServiceAddress;

    // Pricing
    private Double totalAmount;
    private String currency;
    private String paymentStatus;
    private String paymentMethod;

    // Notes
    private String customerNotes;
    private String providerNotes;
    private String cancellationReason;
    private String cancelledBy;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;

    // Relationships
    private UserResponse customer;
    private UserResponse provider;
    private ServiceListingResponse serviceListing;
}

