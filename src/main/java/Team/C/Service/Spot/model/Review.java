package Team.C.Service.Spot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Review entity representing customer reviews and ratings for service providers.
 * Links customers, providers, and bookings with ratings and feedback.
 * Provider responses have been removed as per requirements.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_provider", columnList = "provider_id"),
    @Index(name = "idx_customer", columnList = "customer_id"),
    @Index(name = "idx_booking", columnList = "booking_id"),
    @Index(name = "idx_rating", columnList = "rating")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Customer who wrote the review
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @NotNull(message = "Customer is required")
    private User customer;

    /**
     * Provider being reviewed
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    @NotNull(message = "Provider is required")
    private User provider;

    /**
     * Booking this review is for (optional but recommended)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    /**
     * Rating from 1 to 5
     */
    @Column(nullable = false)
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    /**
     * Review title (optional)
     */
    @Column(length = 200)
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    /**
     * Review comment/feedback
     */
    @Column(columnDefinition = "TEXT")
    @NotBlank(message = "Review comment is required")
    @Size(min = 10, max = 2000, message = "Review must be between 10 and 2000 characters")
    private String comment;

    /**
     * Was the service completed on time?
     */
    @Column(name = "on_time")
    private Boolean onTime;

    /**
     * Would recommend this provider?
     */
    @Column(name = "would_recommend")
    private Boolean wouldRecommend;

    /**
     * Is this review verified (from actual booking)?
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = false;

    /**
     * Is this review flagged for moderation?
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean flagged = false;

    /**
     * Flag reason (if flagged)
     */
    @Column(name = "flag_reason")
    private String flagReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Helper method to check if review is positive (4-5 stars)
     */
    @Transient
    public boolean isPositive() {
        return rating != null && rating >= 4;
    }
}

