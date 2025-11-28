package Team.C.Service.Spot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ServiceListing entity representing a service offered by a provider.
 * Each listing belongs to a provider (User with PROVIDER role) and a category.
 *
 * <p>This entity contains all the details about a specific service offering including
 * pricing, availability, and service-specific information.</p>
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Entity
@Table(name = "service_listings", indexes = {
    @Index(name = "idx_provider", columnList = "provider_id"),
    @Index(name = "idx_category", columnList = "category_id"),
    @Index(name = "idx_city", columnList = "city"),
    @Index(name = "idx_active", columnList = "active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceListing {

    // ==================== Identity Fields ====================

    /**
     * Primary key with auto-increment strategy
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==================== Service Information ====================

    /**
     * Title of the service listing
     */
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String title;

    /**
     * Detailed description of the service
     */
    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // ==================== Pricing Information ====================

    /**
     * Base price for the service
     */
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false)
    private Double price;

    /**
     * Currency code (e.g., "USD", "EUR", "INR")
     */
    @Builder.Default
    @Column(length = 3)
    private String currency = "INR";

    /**
     * Price unit description (e.g., "per hour", "per service", "per sq ft")
     */
    @Column(name = "price_unit", length = 50)
    private String priceUnit;

    // ==================== Service Details ====================

    /**
     * Estimated duration in minutes
     */
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    /**
     * Service location preference (e.g., "On-site", "Remote", "Both")
     */
    @Column(name = "service_location", length = 50)
    private String serviceLocation;

    /**
     * Availability status (e.g., "Available", "Busy", "Unavailable")
     */
    @Builder.Default
    @Column(length = 50)
    private String availability = "Available";

    /**
     * Geographic service area radius in kilometers
     */
    @Column(name = "service_radius_km")
    private Integer serviceRadiusKm;

    // ==================== Location Information ====================

    /**
     * City where service is provided
     */
    @NotBlank(message = "City is required")
    @Column(nullable = false, length = 100)
    private String city;

    /**
     * State or province
     */
    @NotBlank(message = "State is required")
    @Column(nullable = false, length = 100)
    private String state;

    /**
     * Postal/ZIP code
     */
    @NotNull(message = "Pincode is required")
    @Column(nullable = false)
    private Integer pincode;

    // ==================== Media ====================

    /**
     * Primary image URL for the service listing
     */
    @Column(name = "image_url")
    private String imageUrl;

    /**
     * Additional image URLs (comma-separated or JSON array)
     */
    @Column(name = "additional_images", columnDefinition = "TEXT")
    private String additionalImages;

    // ==================== Status Fields ====================

    /**
     * Flag indicating if this listing is active and visible
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    /**
     * Flag indicating if this listing is featured/promoted
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean featured = false;

    /**
     * Total number of bookings for this service
     */
    @Builder.Default
    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    /**
     * Average rating for this specific service (0.0 to 5.0)
     */
    @Builder.Default
    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    /**
     * Total number of reviews for this service
     */
    @Builder.Default
    @Column(name = "review_count")
    private Integer reviewCount = 0;

    /**
     * View count for analytics
     */
    @Builder.Default
    @Column(name = "view_count")
    private Integer viewCount = 0;

    // ==================== Audit Fields ====================

    /**
     * Timestamp when the listing was created
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the listing was last updated
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ==================== Relationships ====================

    /**
     * The provider who created this service listing
     * Many-to-One relationship with User entity
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    @ToString.Exclude
    private User provider;

    /**
     * The category this service belongs to
     * Many-to-One relationship with ServiceCategory entity
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    private ServiceCategory category;

    /**
     * All bookings for this service listing
     * One-to-Many relationship with Booking entity
     */
    @OneToMany(mappedBy = "serviceListing", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Booking> bookings = new ArrayList<>();

    // ==================== Helper Methods ====================

    /**
     * Get full service location as a formatted string
     * @return formatted location string
     */
    public String getFullLocation() {
        return String.format("%s, %s - %d", city, state, pincode);
    }

    /**
     * Get formatted price with currency
     * @return price string with currency symbol
     */
    public String getFormattedPrice() {
        return String.format("%.2f %s", price, currency);
    }

    /**
     * Get formatted price with unit
     * @return complete price description
     */
    public String getPriceWithUnit() {
        if (priceUnit != null && !priceUnit.isEmpty()) {
            return String.format("%.2f %s %s", price, currency, priceUnit);
        }
        return getFormattedPrice();
    }

    /**
     * Increment view count
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * Increment booking count
     */
    public void incrementBookingCount() {
        this.totalBookings++;
    }

    /**
     * Update average rating based on new review
     * @param newRating the rating from the new review (1-5)
     */
    public void updateRating(double newRating) {
        double totalRating = (this.averageRating * this.reviewCount) + newRating;
        this.reviewCount++;
        this.averageRating = totalRating / this.reviewCount;
    }

    /**
     * Check if the service is available for booking
     * @return true if active and available
     */
    public boolean isAvailableForBooking() {
        return this.active && "Available".equalsIgnoreCase(this.availability);
    }

    /**
     * Check if this listing belongs to a specific provider
     * @param providerId the provider ID to check
     * @return true if the provider matches
     */
    public boolean belongsToProvider(Long providerId) {
        return this.provider != null && this.provider.getId().equals(providerId);
    }
}

