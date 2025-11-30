package Team.C.Service.Spot.mapper;

import Team.C.Service.Spot.dto.response.ReviewResponse;
import Team.C.Service.Spot.model.Review;
import org.springframework.stereotype.Component;

/**
 * Mapper for Review entity and DTOs.
 * Provider response fields removed as per requirements.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getName())
                .providerId(review.getProvider().getId())
                .providerName(review.getProvider().getName())
                .bookingId(review.getBooking() != null ? review.getBooking().getId() : null)
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .onTime(review.getOnTime())
                .wouldRecommend(review.getWouldRecommend())
                .verified(review.getVerified())
                .flagged(review.getFlagged())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}

