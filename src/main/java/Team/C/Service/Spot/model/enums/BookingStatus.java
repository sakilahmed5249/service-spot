package Team.C.Service.Spot.model.enums;

/**
 * Booking status enumeration representing the lifecycle of a booking.
 * Tracks the progression from pending to completion or cancellation.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
public enum BookingStatus {
    /**
     * Booking has been created but awaiting provider confirmation
     */
    PENDING,

    /**
     * Provider has confirmed the booking
     */
    CONFIRMED,

    /**
     * Service is currently in progress
     */
    IN_PROGRESS,

    /**
     * Service has been completed successfully
     */
    COMPLETED,

    /**
     * Booking has been cancelled by customer or provider
     */
    CANCELLED,

    /**
     * Provider has rejected the booking request
     */
    REJECTED
}

