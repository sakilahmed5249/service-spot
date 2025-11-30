package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for provider rating statistics.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderRatingStatistics {

    private Long providerId;
    private String providerName;
    private Double averageRating;
    private Long totalReviews;
    private Long positiveReviews; // 4-5 stars

    // Rating distribution
    private Long fiveStars;
    private Long fourStars;
    private Long threeStars;
    private Long twoStars;
    private Long oneStar;

    // Percentages
    private Double recommendationRate; // % of "would recommend"
    private Double onTimeRate; // % of "on time"
}

