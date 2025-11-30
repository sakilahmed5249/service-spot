package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.request.CreateReviewRequest;
import Team.C.Service.Spot.dto.response.ProviderRatingStatistics;
import Team.C.Service.Spot.dto.response.ReviewResponse;
import Team.C.Service.Spot.mapper.ReviewMapper;
import Team.C.Service.Spot.model.Booking;
import Team.C.Service.Spot.model.Review;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.repository.BookingRepository;
import Team.C.Service.Spot.repository.ReviewRepository;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ReviewService.
 * Handles all review-related business logic.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse createReview(CreateReviewRequest request) {
        log.info("Creating review for provider {} by customer {}",
                request.getProviderId(), request.getCustomerId());

        // Validate customer
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Customer not found with ID: " + request.getCustomerId()));

        // Validate provider
        User provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + request.getProviderId()));

        // Check if booking exists and validate
        Booking booking = null;
        boolean verified = false;

        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Booking not found with ID: " + request.getBookingId()));

            // Check if already reviewed
            if (reviewRepository.existsByBookingId(request.getBookingId())) {
                throw new IllegalStateException(
                        "This booking has already been reviewed");
            }

            // Verify booking belongs to customer and provider
            if (!booking.getCustomer().getId().equals(customer.getId())) {
                throw new IllegalArgumentException(
                        "Booking does not belong to this customer");
            }
            if (!booking.getProvider().getId().equals(provider.getId())) {
                throw new IllegalArgumentException(
                        "Booking does not belong to this provider");
            }

            verified = true; // Review is verified because it's from actual booking
        }

        // Create review
        Review review = Review.builder()
                .customer(customer)
                .provider(provider)
                .booking(booking)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .onTime(request.getOnTime())
                .wouldRecommend(request.getWouldRecommend())
                .verified(verified)
                .flagged(false)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created with ID: {}", savedReview.getId());

        // Update provider's average rating
        updateProviderRating(provider.getId());

        return reviewMapper.toResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long id) {
        log.info("Fetching review with ID: {}", id);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Review not found with ID: " + id));

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProvider(Long providerId) {
        log.info("Fetching reviews for provider ID: {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Review> reviews = reviewRepository.findByProviderOrderByCreatedAtDesc(provider);

        return reviews.stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByCustomer(Long customerId) {
        log.info("Fetching reviews by customer ID: {}", customerId);

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Customer not found with ID: " + customerId));

        List<Review> reviews = reviewRepository.findByCustomerOrderByCreatedAtDesc(customer);

        return reviews.stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewByBooking(Long bookingId) {
        log.info("Fetching review for booking ID: {}", bookingId);

        Review review = reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Review not found for booking ID: " + bookingId));

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasBookingBeenReviewed(Long bookingId) {
        return reviewRepository.existsByBookingId(bookingId);
    }

    @Override
    @Transactional(readOnly = true)
    public ProviderRatingStatistics getProviderStatistics(Long providerId) {
        log.info("Calculating rating statistics for provider {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        // Calculate average rating
        Double averageRating = reviewRepository.calculateAverageRating(provider);
        if (averageRating == null) {
            averageRating = 0.0;
        }

        // Get total reviews
        Long totalReviews = reviewRepository.countByProvider(provider);

        // Count ratings by star
        Long fiveStars = reviewRepository.countByProviderAndRating(provider, 5);
        Long fourStars = reviewRepository.countByProviderAndRating(provider, 4);
        Long threeStars = reviewRepository.countByProviderAndRating(provider, 3);
        Long twoStars = reviewRepository.countByProviderAndRating(provider, 2);
        Long oneStar = reviewRepository.countByProviderAndRating(provider, 1);

        // Positive reviews (4-5 stars)
        Long positiveReviews = fourStars + fiveStars;


        // Get all reviews for calculating percentages
        List<Review> allReviews = reviewRepository.findByProvider(provider);

        long recommendCount = allReviews.stream()
                .filter(r -> Boolean.TRUE.equals(r.getWouldRecommend()))
                .count();

        long onTimeCount = allReviews.stream()
                .filter(r -> Boolean.TRUE.equals(r.getOnTime()))
                .count();

        Double recommendationRate = totalReviews > 0 ?
                (recommendCount * 100.0 / totalReviews) : 0.0;
        Double onTimeRate = totalReviews > 0 ?
                (onTimeCount * 100.0 / totalReviews) : 0.0;

        return ProviderRatingStatistics.builder()
                .providerId(providerId)
                .providerName(provider.getName())
                .averageRating(Math.round(averageRating * 10.0) / 10.0) // Round to 1 decimal
                .totalReviews(totalReviews)
                .positiveReviews(positiveReviews)
                .fiveStars(fiveStars)
                .fourStars(fourStars)
                .threeStars(threeStars)
                .twoStars(twoStars)
                .oneStar(oneStar)
                .recommendationRate(Math.round(recommendationRate * 10.0) / 10.0)
                .onTimeRate(Math.round(onTimeRate * 10.0) / 10.0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getRecentReviews(Long providerId, int limit) {
        log.info("Fetching {} recent reviews for provider {}", limit, providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Review> reviews = reviewRepository.findRecentByProvider(provider);

        return reviews.stream()
                .limit(limit)
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getPositiveReviews(Long providerId) {
        log.info("Fetching positive reviews for provider {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        List<Review> reviews = reviewRepository.findPositiveReviews(provider);

        return reviews.stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    public ReviewResponse flagReview(Long reviewId, String reason) {
        log.info("Flagging review {} for moderation", reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Review not found with ID: " + reviewId));

        review.setFlagged(true);
        review.setFlagReason(reason);

        Review updatedReview = reviewRepository.save(review);
        log.info("Review {} flagged successfully", reviewId);

        return reviewMapper.toResponse(updatedReview);
    }

    @Override
    public ReviewResponse unflagReview(Long reviewId) {
        log.info("Unflagging review {}", reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Review not found with ID: " + reviewId));

        review.setFlagged(false);
        review.setFlagReason(null);

        Review updatedReview = reviewRepository.save(review);
        log.info("Review {} unflagged successfully", reviewId);

        return reviewMapper.toResponse(updatedReview);
    }

    @Override
    public void deleteReview(Long id) {
        log.info("Deleting review with ID: {}", id);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Review not found with ID: " + id));

        Long providerId = review.getProvider().getId();

        reviewRepository.delete(review);
        log.info("Review {} deleted successfully", id);

        // Update provider rating after deletion
        updateProviderRating(providerId);
    }

    @Override
    public void updateProviderRating(Long providerId) {
        log.info("Updating rating for provider {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Provider not found with ID: " + providerId));

        // Calculate new average
        Double averageRating = reviewRepository.calculateAverageRating(provider);
        Long reviewCount = reviewRepository.countByProvider(provider);

        // Update provider
        provider.setAverageRating(averageRating != null ? averageRating : 0.0);
        provider.setReviewCount(reviewCount.intValue());

        userRepository.save(provider);

        log.info("Provider {} rating updated: {} stars ({} reviews)",
                providerId, averageRating, reviewCount);
    }
}
