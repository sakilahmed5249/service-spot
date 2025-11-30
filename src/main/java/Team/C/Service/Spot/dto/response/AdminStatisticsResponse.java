package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin dashboard statistics.
 * Provides comprehensive system metrics for administrators.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatisticsResponse {

    // User Statistics
    private Long totalUsers;
    private Long totalCustomers;
    private Long totalProviders;
    private Long totalAdmins;
    private Long verifiedProviders;
    private Long pendingVerifications;
    private Long activeUsers;
    private Long suspendedUsers;

    // Booking Statistics
    private Long totalBookings;
    private Long activeBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long inProgressBookings;

    // Revenue Statistics
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Double averageBookingValue;
    private Double todayRevenue;

    // Service Statistics
    private Long totalServices;
    private Long activeServices;
    private Long featuredServices;

    // Recent Activity
    private Long todayBookings;
    private Long todayRegistrations;
    private Long todayCompletedBookings;
}

