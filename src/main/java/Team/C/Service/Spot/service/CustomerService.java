package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.dto.response.CustomerStatisticsResponse;

import java.util.List;

/**
 * Service interface for Customer operations.
 * Handles customer-specific business logic.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
public interface CustomerService {

    /**
     * Get customer statistics for dashboard.
     *
     * @param customerId customer ID
     * @return customer statistics
     */
    CustomerStatisticsResponse getCustomerStatistics(Long customerId);

    /**
     * Get customer's recent bookings.
     *
     * @param customerId customer ID
     * @param limit maximum number of results
     * @return list of recent bookings
     */
    List<BookingResponse> getRecentBookings(Long customerId, int limit);

    /**
     * Get customer's upcoming bookings.
     *
     * @param customerId customer ID
     * @return list of upcoming bookings
     */
    List<BookingResponse> getUpcomingBookings(Long customerId);
}

