package Team.C.Service.Spot.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Service listing ID is required")
    private Long serviceListingId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    @NotNull(message = "Booking time is required")
    private LocalTime bookingTime;

    private Integer durationMinutes;

    @NotBlank(message = "Service address is required")
    @Size(max = 50, message = "Door number cannot exceed 50 characters")
    private String serviceDoorNo;

    @NotBlank(message = "Service address line is required")
    @Size(max = 255, message = "Address line cannot exceed 255 characters")
    private String serviceAddressLine;

    @NotBlank(message = "Service city is required")
    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String serviceCity;

    @NotBlank(message = "Service state is required")
    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String serviceState;

    @NotNull(message = "Service pincode is required")
    @Min(value = 100000, message = "Invalid pincode")
    @Max(value = 999999, message = "Invalid pincode")
    private Integer servicePincode;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String customerNotes;

    @Size(max = 50, message = "Payment method cannot exceed 50 characters")
    private String paymentMethod;
}

