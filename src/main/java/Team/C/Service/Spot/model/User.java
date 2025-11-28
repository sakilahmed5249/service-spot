package Team.C.Service.Spot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import Team.C.Service.Spot.model.enums.Role;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User entity representing both customers and service providers in the system.
 * This unified entity uses a discriminator pattern with Role enum to distinguish user types.
 *
 * <p>Design Pattern: Single Table Inheritance approach where both customers and providers
 * share common attributes (contact info, location) but are differentiated by role.</p>
 *
 * <p>Security Note: Password should be hashed using BCrypt before persistence.</p>
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_role", columnList = "role"),
    @Index(name = "idx_city", columnList = "city")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // ==================== Identity Fields ====================

    /**
     * Primary key with auto-increment strategy
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User role determining access level and available features
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @NotNull(message = "Role is required")
    private Role role;

    // ==================== Authentication Fields ====================

    /**
     * User's email address - used as username for authentication
     * Must be unique across the system
     */
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    /**
     * Hashed password for authentication
     * Should be encrypted using BCrypt with strength 10-12
     */
    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    // ==================== Personal Information ====================

    /**
     * Full name or business name
     */
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * Contact phone number
     */
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Invalid phone number format")
    @Column(unique = true, nullable = false, length = 15)
    private String phone;

    // ==================== Location Information ====================

    /**
     * Door/House/Building number
     */
    @NotBlank(message = "Door number is required")
    @Column(name = "door_no", nullable = false, length = 50)
    private String doorNo;

    /**
     * Street address or locality
     */
    @NotBlank(message = "Address line is required")
    @Column(name = "address_line", nullable = false)
    private String addressLine;

    /**
     * City name
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
    @Min(value = 100000, message = "Invalid pincode")
    @Max(value = 999999, message = "Invalid pincode")
    @Column(nullable = false)
    private Integer pincode;

    // ==================== Provider-Specific Fields ====================

    /**
     * Service category offered by provider (e.g., "Plumbing", "Electrical")
     * Only applicable for PROVIDER role
     */
    @Column(name = "service_type", length = 100)
    private String serviceType;

    /**
     * Verification status for providers
     * Indicates if the provider has been verified by admin
     */
    @Builder.Default
    @Column(name = "verified")
    private Boolean verified = false;

    /**
     * Approximate service pricing (base rate)
     * Only applicable for PROVIDER role
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(name = "approx_price")
    private Double approxPrice;

    /**
     * Provider's business description or bio
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Years of experience (for providers)
     */
    @Min(value = 0, message = "Experience cannot be negative")
    @Column(name = "years_experience")
    private Integer yearsExperience;

    /**
     * Average rating (0.0 to 5.0)
     */
    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    @Builder.Default
    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    /**
     * Total number of reviews received
     */
    @Builder.Default
    @Column(name = "review_count")
    private Integer reviewCount = 0;

    // ==================== Account Status Fields ====================

    /**
     * Flag indicating if the account is active
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    /**
     * Flag indicating if email has been verified
     */
    @Builder.Default
    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    // ==================== Audit Fields ====================

    /**
     * Timestamp when the user account was created
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the user account was last updated
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ==================== Relationships ====================

    /**
     * Service listings created by this provider
     * Only populated for PROVIDER role
     */
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ServiceListing> serviceListings = new ArrayList<>();

    /**
     * Bookings created by this customer
     * Only populated for CUSTOMER role
     */
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookingsAsCustomer = new ArrayList<>();

    /**
     * Bookings received by this provider
     * Only populated for PROVIDER role
     */
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookingsAsProvider = new ArrayList<>();

    // ==================== Helper Methods ====================

    /**
     * Check if the user is a customer
     * @return true if role is CUSTOMER
     */
    public boolean isCustomer() {
        return this.role == Role.CUSTOMER;
    }

    /**
     * Check if the user is a provider
     * @return true if role is PROVIDER
     */
    public boolean isProvider() {
        return this.role == Role.PROVIDER;
    }

    /**
     * Get full address as a single string
     * @return formatted address
     */
    public String getFullAddress() {
        return String.format("%s, %s, %s, %s - %d",
            doorNo, addressLine, city, state, pincode);
    }

    /**
     * Add a service listing (for providers)
     * @param listing the service listing to add
     */
    public void addServiceListing(ServiceListing listing) {
        serviceListings.add(listing);
        listing.setProvider(this);
    }

    /**
     * Remove a service listing (for providers)
     * @param listing the service listing to remove
     */
    public void removeServiceListing(ServiceListing listing) {
        serviceListings.remove(listing);
        listing.setProvider(null);
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
}

