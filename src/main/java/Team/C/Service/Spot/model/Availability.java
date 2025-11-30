package Team.C.Service.Spot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import Team.C.Service.Spot.model.enums.DayOfWeek;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Availability entity representing provider's available time slots.
 * Allows providers to set their working hours and manage bookings.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Entity
@Table(name = "availability",
    indexes = {
        @Index(name = "idx_provider_day", columnList = "provider_id, day_of_week"),
        @Index(name = "idx_provider_available", columnList = "provider_id, is_available")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_provider_day_time",
            columnNames = {"provider_id", "day_of_week", "start_time"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability {

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
     * Day of week (MONDAY, TUESDAY, etc.)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 20)
    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

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
    @Builder.Default
    @Column(name = "max_bookings")
    @Min(value = 1, message = "Max bookings must be at least 1")
    private Integer maxBookings = 1;

    /**
     * Current number of bookings for this slot
     */
    @Builder.Default
    @Column(name = "current_bookings")
    @Min(value = 0, message = "Current bookings cannot be negative")
    private Integer currentBookings = 0;

    /**
     * Break duration in minutes (if applicable)
     */
    @Column(name = "break_duration")
    @Min(value = 0, message = "Break duration cannot be negative")
    private Integer breakDuration;

    /**
     * Notes about this availability slot
     */
    @Column(length = 500)
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Helper method to check if slot is fully booked
     */
    @Transient
    public boolean isFullyBooked() {
        return currentBookings != null && maxBookings != null
            && currentBookings >= maxBookings;
    }

    /**
     * Helper method to check if slot can accept more bookings
     */
    @Transient
    public boolean canAcceptBooking() {
        return isAvailable && !isFullyBooked();
    }

    /**
     * Increment booking count
     */
    public void incrementBookingCount() {
        if (currentBookings == null) {
            currentBookings = 0;
        }
        currentBookings++;

        if (isFullyBooked()) {
            isAvailable = false;
        }
    }

    /**
     * Decrement booking count (when booking cancelled)
     */
    public void decrementBookingCount() {
        if (currentBookings != null && currentBookings > 0) {
            currentBookings--;
            isAvailable = true;
        }
    }
}

