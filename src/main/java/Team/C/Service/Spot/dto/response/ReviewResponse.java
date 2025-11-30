package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for review responses.
 * Provider response fields removed as per requirements.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private Long bookingId;
    private Integer rating;
    private String title;
    private String comment;
    private Boolean onTime;
    private Boolean wouldRecommend;
    private Boolean verified;
    private Boolean flagged;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

