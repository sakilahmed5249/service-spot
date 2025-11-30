package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.request.CreateReviewRequest;
import Team.C.Service.Spot.dto.request.ReviewResponseRequest;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.ProviderRatingStatistics;
import Team.C.Service.Spot.dto.response.ReviewResponse;
import Team.C.Service.Spot.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Review operations.
 * Handles review creation, retrieval, and rating management.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Create a new review
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", review));
    }

    /**
     * Get review by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
        ReviewResponse review = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", review));
    }

    /**
     * Get all reviews for a provider
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByProvider(
            @PathVariable Long providerId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProvider(providerId);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
    }

    /**
     * Get all reviews by a customer
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByCustomer(
            @PathVariable Long customerId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
    }

    /**
     * Get review for a booking
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewByBooking(
            @PathVariable Long bookingId) {
        ReviewResponse review = reviewService.getReviewByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", review));
    }

    /**
     * Check if booking has been reviewed
     */
    @GetMapping("/booking/{bookingId}/exists")
    public ResponseEntity<ApiResponse<Boolean>> hasBookingBeenReviewed(
            @PathVariable Long bookingId) {
        boolean exists = reviewService.hasBookingBeenReviewed(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Check completed", exists));
    }

    /**
     * REMOVED: Provider response feature removed per requirements
     * Provider responds to a review
     */
    /*
    @PostMapping("/{reviewId}/respond")
    public ResponseEntity<ApiResponse<ReviewResponse>> respondToReview(
            @PathVariable Long reviewId,
            @RequestParam Long providerId,
            @Valid @RequestBody ReviewResponseRequest request) {
        ReviewResponse review = reviewService.respondToReview(reviewId, providerId, request);
        return ResponseEntity.ok(ApiResponse.success("Response added successfully", review));
    }
    */

    /**
     * Get provider rating statistics
     */
    @GetMapping("/provider/{providerId}/statistics")
    public ResponseEntity<ApiResponse<ProviderRatingStatistics>> getProviderStatistics(
            @PathVariable Long providerId) {
        ProviderRatingStatistics stats = reviewService.getProviderStatistics(providerId);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }

    /**
     * Get recent reviews for a provider
     */
    @GetMapping("/provider/{providerId}/recent")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getRecentReviews(
            @PathVariable Long providerId,
            @RequestParam(defaultValue = "10") int limit) {
        List<ReviewResponse> reviews = reviewService.getRecentReviews(providerId, limit);
        return ResponseEntity.ok(ApiResponse.success("Recent reviews retrieved successfully", reviews));
    }

    /**
     * Get positive reviews (4-5 stars)
     */
    @GetMapping("/provider/{providerId}/positive")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getPositiveReviews(
            @PathVariable Long providerId) {
        List<ReviewResponse> reviews = reviewService.getPositiveReviews(providerId);
        return ResponseEntity.ok(ApiResponse.success("Positive reviews retrieved successfully", reviews));
    }


    /**
     * Flag a review for moderation
     */
    @PostMapping("/{reviewId}/flag")
    public ResponseEntity<ApiResponse<ReviewResponse>> flagReview(
            @PathVariable Long reviewId,
            @RequestParam String reason) {
        ReviewResponse review = reviewService.flagReview(reviewId, reason);
        return ResponseEntity.ok(ApiResponse.success("Review flagged for moderation", review));
    }

    /**
     * Unflag a review (admin only)
     */
    @PostMapping("/{reviewId}/unflag")
    public ResponseEntity<ApiResponse<ReviewResponse>> unflagReview(@PathVariable Long reviewId) {
        ReviewResponse review = reviewService.unflagReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review unflagged", review));
    }

    /**
     * Delete a review
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", "Deleted"));
    }
}

