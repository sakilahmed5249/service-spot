package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for customer dashboard statistics.
 * Provides personalized metrics for customers.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerStatisticsResponse {

    // Booking Statistics
    private Long totalBookings;
    private Long activeBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long upcomingBookings;

    // Financial Statistics
    private Double totalSpent;
    private Double averageBookingValue;
    private Double thisMonthSpent;
    private Double lastMonthSpent;

    // Service Statistics
    private Long uniqueServicesBooked;
    private Long favoriteProvidersCount;
    private Long pendingReviews;

    // Activity
    private String lastBookingDate;
    private String memberSince;
    private Long reviewsWritten;
}

