package Team.C.Service.Spot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import Team.C.Service.Spot.model.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Booking entity representing a service booking request.
 * Connects customers with providers through service listings.
 *
 * <p>Lifecycle: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED/CANCELLED</p>
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_customer", columnList = "customer_id"),
    @Index(name = "idx_provider", columnList = "provider_id"),
    @Index(name = "idx_service", columnList = "service_listing_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_booking_date", columnList = "booking_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    // ==================== Identity Fields ====================

    /**
     * Primary key with auto-increment strategy
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique booking reference number (e.g., "BK-2025-001234")
     */
    @Column(name = "booking_reference", unique = true, length = 50)
    private String bookingReference;

    // ==================== Booking Details ====================

    /**
     * Date when the service is scheduled
     */
    @NotNull(message = "Booking date is required")
    @Future(message = "Booking date must be in the future")
    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    /**
     * Preferred time slot for the service
     */
    @NotNull(message = "Booking time is required")
    @Column(name = "booking_time", nullable = false)
    private LocalTime bookingTime;

    /**
     * Estimated duration in minutes
     */
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    /**
     * Current status of the booking
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    // ==================== Location Information ====================

    /**
     * Service address - door/house number
     */
    @NotBlank(message = "Service address is required")
    @Column(name = "service_door_no", nullable = false, length = 50)
    private String serviceDoorNo;

    /**
     * Service address - street/locality
     */
    @NotBlank(message = "Service address line is required")
    @Column(name = "service_address_line", nullable = false)
    private String serviceAddressLine;

    /**
     * Service city
     */
    @NotBlank(message = "Service city is required")
    @Column(name = "service_city", nullable = false, length = 100)
    private String serviceCity;

    /**
     * Service state
     */
    @NotBlank(message = "Service state is required")
    @Column(name = "service_state", nullable = false, length = 100)
    private String serviceState;

    /**
     * Service pincode
     */
    @NotNull(message = "Service pincode is required")
    @Column(name = "service_pincode", nullable = false)
    private Integer servicePincode;

    // ==================== Pricing Information ====================

    /**
     * Total amount for this booking
     */
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    /**
     * Currency code
     */
    @Builder.Default
    @Column(length = 3)
    private String currency = "INR";

    /**
     * Payment status (e.g., "Pending", "Paid", "Refunded")
     */
    @Builder.Default
    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "Pending";

    /**
     * Payment method (e.g., "Cash", "Card", "UPI")
     */
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // ==================== Additional Information ====================

    /**
     * Customer's notes or special instructions
     */
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    @Column(columnDefinition = "TEXT")
    private String customerNotes;

    /**
     * Provider's response or notes
     */
    @Size(max = 1000, message = "Provider notes cannot exceed 1000 characters")
    @Column(name = "provider_notes", columnDefinition = "TEXT")
    private String providerNotes;

    /**
     * Reason for cancellation (if applicable)
     */
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    /**
     * Who cancelled the booking (e.g., "customer", "provider", "system")
     */
    @Column(name = "cancelled_by", length = 20)
    private String cancelledBy;

    // ==================== Timestamps ====================

    /**
     * When the booking was created
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When the booking was last updated
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * When the booking was confirmed
     */
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    /**
     * When the service was completed
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * When the booking was cancelled
     */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    // ==================== Relationships ====================

    /**
     * The customer who made this booking
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @ToString.Exclude
    private User customer;

    /**
     * The provider who will fulfill this booking
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    @ToString.Exclude
    private User provider;

    /**
     * The service listing being booked
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_listing_id", nullable = false)
    @ToString.Exclude
    private ServiceListing serviceListing;

    // ==================== Helper Methods ====================

    /**
     * Get full service address as formatted string
     * @return formatted address
     */
    public String getFullServiceAddress() {
        return String.format("%s, %s, %s, %s - %d",
            serviceDoorNo, serviceAddressLine, serviceCity, serviceState, servicePincode);
    }

    /**
     * Get formatted total with currency
     * @return price string
     */
    public String getFormattedTotal() {
        return String.format("%.2f %s", totalAmount, currency);
    }

    /**
     * Check if booking can be cancelled
     * @return true if cancellable
     */
    public boolean isCancellable() {
        return status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED;
    }

    /**
     * Check if booking can be confirmed
     * @return true if confirmable
     */
    public boolean isConfirmable() {
        return status == BookingStatus.PENDING;
    }

    /**
     * Check if booking can be marked as in progress
     * @return true if can start
     */
    public boolean canStart() {
        return status == BookingStatus.CONFIRMED;
    }

    /**
     * Check if booking can be completed
     * @return true if completable
     */
    public boolean canComplete() {
        return status == BookingStatus.IN_PROGRESS;
    }

    /**
     * Confirm the booking
     */
    public void confirm() {
        if (isConfirmable()) {
            this.status = BookingStatus.CONFIRMED;
            this.confirmedAt = LocalDateTime.now();
        }
    }

    /**
     * Start the service
     */
    public void start() {
        if (canStart()) {
            this.status = BookingStatus.IN_PROGRESS;
        }
    }

    /**
     * Complete the booking
     */
    public void complete() {
        if (canComplete()) {
            this.status = BookingStatus.COMPLETED;
            this.completedAt = LocalDateTime.now();
        }
    }

    /**
     * Cancel the booking
     * @param reason cancellation reason
     * @param cancelledBy who cancelled (customer/provider/system)
     */
    public void cancel(String reason, String cancelledBy) {
        if (isCancellable()) {
            this.status = BookingStatus.CANCELLED;
            this.cancellationReason = reason;
            this.cancelledBy = cancelledBy;
            this.cancelledAt = LocalDateTime.now();
        }
    }

    /**
     * Reject the booking
     * @param reason rejection reason
     */
    public void reject(String reason) {
        if (status == BookingStatus.PENDING) {
            this.status = BookingStatus.REJECTED;
            this.providerNotes = reason;
            this.cancelledAt = LocalDateTime.now();
        }
    }

    /**
     * Generate unique booking reference
     */
    @PrePersist
    public void generateBookingReference() {
        if (this.bookingReference == null || this.bookingReference.isEmpty()) {
            // Format: BK-YYYY-NNNNNN (will be updated with actual ID after persist)
            this.bookingReference = String.format("BK-%d-%06d",
                LocalDateTime.now().getYear(),
                System.currentTimeMillis() % 1000000);
        }
    }
}

