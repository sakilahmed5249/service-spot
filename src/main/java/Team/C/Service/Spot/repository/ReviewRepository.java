package Team.C.Service.Spot.repository;

import Team.C.Service.Spot.model.Review;
import Team.C.Service.Spot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Review entity operations.
 * Provides CRUD and custom query methods for reviews management.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find all reviews for a specific provider.
     */
    List<Review> findByProvider(User provider);

    /**
     * Find all reviews written by a customer.
     */
    List<Review> findByCustomer(User customer);

    /**
     * Find review for a specific booking.
     */
    Optional<Review> findByBookingId(Long bookingId);

    /**
     * Check if customer has already reviewed a booking.
     */
    boolean existsByBookingId(Long bookingId);

    /**
     * Find reviews by provider ordered by creation date.
     */
    List<Review> findByProviderOrderByCreatedAtDesc(User provider);

    /**
     * Find reviews by customer ordered by creation date.
     */
    List<Review> findByCustomerOrderByCreatedAtDesc(User customer);

    /**
     * Find all reviews for bookings of a specific service listing.
     * Used for cascading deletion when service is deleted.
     */
    @Query("SELECT r FROM Review r WHERE r.booking.serviceListing.id = :serviceListingId")
    List<Review> findByServiceListingId(@Param("serviceListingId") Long serviceListingId);

    /**
     * Find all reviews by customer ID.
     * Used for cascading deletion when customer is deleted.
     */
    @Query("SELECT r FROM Review r WHERE r.customer.id = :customerId")
    List<Review> findByCustomerId(@Param("customerId") Long customerId);

    /**
     * Find reviews by provider with specific rating.
     */
    List<Review> findByProviderAndRating(User provider, Integer rating);

    /**
     * Find verified reviews for a provider.
     */
    List<Review> findByProviderAndVerified(User provider, Boolean verified);

    /**
     * Find flagged reviews for moderation.
     */
    List<Review> findByFlagged(Boolean flagged);

    /**
     * Count total reviews for a provider.
     */
    long countByProvider(User provider);

    /**
     * Count reviews by provider and rating.
     */
    long countByProviderAndRating(User provider, Integer rating);

    /**
     * Calculate average rating for a provider.
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.provider = :provider AND r.flagged = false")
    Double calculateAverageRating(@Param("provider") User provider);

    /**
     * Get rating distribution for a provider.
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.provider = :provider " +
           "AND r.flagged = false GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistribution(@Param("provider") User provider);

    /**
     * Find recent reviews for a provider.
     */
    @Query("SELECT r FROM Review r WHERE r.provider = :provider AND r.flagged = false " +
           "ORDER BY r.createdAt DESC")
    List<Review> findRecentByProvider(@Param("provider") User provider);

    /**
     * Find positive reviews (4-5 stars) for a provider.
     */
    @Query("SELECT r FROM Review r WHERE r.provider = :provider AND r.rating >= 4 " +
           "AND r.flagged = false ORDER BY r.createdAt DESC")
    List<Review> findPositiveReviews(@Param("provider") User provider);
}

