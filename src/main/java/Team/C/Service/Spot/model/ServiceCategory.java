package Team.C.Service.Spot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ServiceCategory entity representing different types of services offered in the platform.
 * Provides classification for service listings (e.g., Plumbing, Electrical, Cleaning).
 *
 * <p>Examples: Home Repair, Beauty & Wellness, Education & Tutoring,
 * Event Services, Health Services, IT & Tech Support, etc.</p>
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Entity
@Table(name = "service_categories", indexes = {
    @Index(name = "idx_category_name", columnList = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCategory {

    /**
     * Primary key with auto-increment strategy
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Category name (e.g., "Plumbing", "Electrical", "Cleaning")
     * Must be unique across the system
     */
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
    @Column(unique = true, nullable = false, length = 50)
    private String name;

    /**
     * Detailed description of the category
     */
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Icon identifier for UI representation (e.g., "wrench", "lightbulb", "broom")
     * Used by frontend to display appropriate icons
     */
    @Column(length = 50)
    private String icon;

    /**
     * URL-friendly slug for the category (e.g., "home-repair", "beauty-wellness")
     */
    @Column(unique = true, length = 50)
    private String slug;

    /**
     * Flag indicating if this category is currently active
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    /**
     * Display order for sorting categories in UI
     */
    @Builder.Default
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    /**
     * Timestamp when the category was created
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * All service listings under this category
     */
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ServiceListing> serviceListings = new ArrayList<>();

    /**
     * Get count of active service listings in this category
     * @return number of active listings
     */
    public int getActiveListingsCount() {
        return (int) serviceListings.stream()
            .filter(ServiceListing::getActive)
            .count();
    }

    /**
     * Lifecycle callback to generate slug before persistence
     */
    @PrePersist
    public void generateSlug() {
        if (this.slug == null || this.slug.isEmpty()) {
            this.slug = this.name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
        }
    }
}

