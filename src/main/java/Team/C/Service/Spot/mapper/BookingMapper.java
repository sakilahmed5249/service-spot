package Team.C.Service.Spot.mapper;

import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.model.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for Booking entity and DTOs conversion.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final UserMapper userMapper;
    private final ServiceListingMapper serviceListingMapper;

    /**
     * Convert Booking entity to BookingResponse DTO
     *
     * @param booking the booking entity
     * @return BookingResponse DTO
     */
    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .durationMinutes(booking.getDurationMinutes())
                .status(booking.getStatus())
                .serviceDoorNo(booking.getServiceDoorNo())
                .serviceAddressLine(booking.getServiceAddressLine())
                .serviceCity(booking.getServiceCity())
                .serviceState(booking.getServiceState())
                .servicePincode(booking.getServicePincode())
                .fullServiceAddress(booking.getFullServiceAddress())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .paymentStatus(booking.getPaymentStatus())
                .paymentMethod(booking.getPaymentMethod())
                .customerNotes(booking.getCustomerNotes())
                .providerNotes(booking.getProviderNotes())
                .cancellationReason(booking.getCancellationReason())
                .cancelledBy(booking.getCancelledBy())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .completedAt(booking.getCompletedAt())
                .cancelledAt(booking.getCancelledAt())
                .customer(userMapper.toResponse(booking.getCustomer()))
                .provider(userMapper.toResponse(booking.getProvider()))
                .serviceListing(serviceListingMapper.toResponse(booking.getServiceListing()))
                .build();
    }
}

