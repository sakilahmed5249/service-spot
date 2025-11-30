package Team.C.Service.Spot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * SpecificAvailability entity representing provider's availability for specific dates.
 * Allows providers to set exact dates and times when they are available for services.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-30
 */
@Entity
@Table(name = "specific_availability",
    indexes = {
        @Index(name = "idx_provider_date", columnList = "provider_id, available_date"),
        @Index(name = "idx_service_date", columnList = "service_listing_id, available_date"),
        @Index(name = "idx_provider_service", columnList = "provider_id, service_listing_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecificAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Provider this availability belongs to
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    @NotNull(message = "Provider is required")
    private User provider;

    /**
     * Service listing this availability is for (optional - can be for all services)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_listing_id")
    private ServiceListing serviceListing;

    /**
     * Specific date when provider is available
     */
    @Column(name = "available_date", nullable = false)
    @NotNull(message = "Available date is required")
    @Future(message = "Available date must be in the future")
    private LocalDate availableDate;

    /**
     * Start time of availability slot
     */
    @Column(name = "start_time", nullable = false)
    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    /**
     * End time of availability slot
     */
    @Column(name = "end_time", nullable = false)
    @NotNull(message = "End time is required")
    private LocalTime endTime;

    /**
     * Is this slot currently available for booking?
     */
    @Builder.Default
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    /**
     * Maximum number of bookings for this slot
     */
    @Column(name = "max_bookings")
    private Integer maxBookings;

    /**
     * Current number of bookings for this slot
     */
    @Builder.Default
    @Column(name = "current_bookings", nullable = false)
    private Integer currentBookings = 0;

    /**
     * Notes for this availability slot
     */
    @Column(name = "notes", length = 500)
    private String notes;

    /**
     * Timestamps
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Check if this slot is fully booked
     */
    public boolean isFullyBooked() {
        return maxBookings != null && currentBookings != null && currentBookings >= maxBookings;
    }

    /**
     * Check if this slot can accept more bookings
     */
    public boolean canAcceptBooking() {
        return isAvailable && !isFullyBooked() && availableDate.isAfter(LocalDate.now().minusDays(1));
    }

    /**
     * Increment booking count
     */
    public void incrementBookingCount() {
        if (currentBookings == null) {
            currentBookings = 0;
        }
        currentBookings++;

        // If max bookings reached, mark as unavailable
        if (maxBookings != null && currentBookings >= maxBookings) {
            isAvailable = false;
        }
    }

    /**
     * Decrement booking count (when booking is cancelled)
     */
    public void decrementBookingCount() {
        if (currentBookings != null && currentBookings > 0) {
            currentBookings--;
            // Re-enable if was disabled due to full bookings
            if (maxBookings != null && currentBookings < maxBookings) {
                isAvailable = true;
            }
        }
    }
}

