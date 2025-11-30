package Team.C.Service.Spot.dto.request;

import Team.C.Service.Spot.model.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingStatusRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    @Size(max = 1000, message = "Provider notes cannot exceed 1000 characters")
    private String providerNotes;

    @Size(max = 1000, message = "Cancellation reason cannot exceed 1000 characters")
    private String cancellationReason;

    private String cancelledBy;
}

