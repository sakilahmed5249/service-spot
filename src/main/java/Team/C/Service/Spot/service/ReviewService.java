package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.request.CreateReviewRequest;
import Team.C.Service.Spot.dto.request.ReviewResponseRequest;
import Team.C.Service.Spot.dto.response.ProviderRatingStatistics;
import Team.C.Service.Spot.dto.response.ReviewResponse;

import java.util.List;

/**
 * Service interface for Review operations.
 * Handles review creation, updates, and ratings calculation.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
public interface ReviewService {

    /**
     * Create a new review
     */
    ReviewResponse createReview(CreateReviewRequest request);

    /**
     * Get review by ID
     */
    ReviewResponse getReviewById(Long id);

    /**
     * Get all reviews for a provider
     */
    List<ReviewResponse> getReviewsByProvider(Long providerId);

    /**
     * Get all reviews by a customer
     */
    List<ReviewResponse> getReviewsByCustomer(Long customerId);

    /**
     * Get review for a specific booking
     */
    ReviewResponse getReviewByBooking(Long bookingId);

    /**
     * Check if booking has been reviewed
     */
    boolean hasBookingBeenReviewed(Long bookingId);


    /**
     * Get provider rating statistics
     */
    ProviderRatingStatistics getProviderStatistics(Long providerId);

    /**
     * Get recent reviews for a provider
     */
    List<ReviewResponse> getRecentReviews(Long providerId, int limit);

    /**
     * Get positive reviews (4-5 stars) for a provider
     */
    List<ReviewResponse> getPositiveReviews(Long providerId);


    /**
     * Flag a review for moderation
     */
    ReviewResponse flagReview(Long reviewId, String reason);

    /**
     * Unflag a review (admin action)
     */
    ReviewResponse unflagReview(Long reviewId);

    /**
     * Delete a review
     */
    void deleteReview(Long id);

    /**
     * Update provider's average rating (called after review creation/update)
     */
    void updateProviderRating(Long providerId);
}

