package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.dto.response.CustomerStatisticsResponse;
import Team.C.Service.Spot.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Customer-specific operations.
 * Handles customer dashboard and statistics.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Get customer statistics for dashboard.
     *
     * @param customerId customer ID
     * @return customer statistics
     */
    @GetMapping("/{customerId}/statistics")
    public ResponseEntity<ApiResponse<CustomerStatisticsResponse>> getCustomerStatistics(
            @PathVariable Long customerId) {
        CustomerStatisticsResponse stats = customerService.getCustomerStatistics(customerId);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }

    /**
     * Get customer's recent bookings.
     *
     * @param customerId customer ID
     * @param limit maximum results (default 5)
     * @return list of recent bookings
     */
    @GetMapping("/{customerId}/bookings/recent")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getRecentBookings(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "5") int limit) {
        List<BookingResponse> bookings = customerService.getRecentBookings(customerId, limit);
        return ResponseEntity.ok(ApiResponse.success("Recent bookings retrieved successfully", bookings));
    }

    /**
     * Get customer's upcoming bookings.
     *
     * @param customerId customer ID
     * @return list of upcoming bookings
     */
    @GetMapping("/{customerId}/bookings/upcoming")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUpcomingBookings(
            @PathVariable Long customerId) {
        List<BookingResponse> bookings = customerService.getUpcomingBookings(customerId);
        return ResponseEntity.ok(ApiResponse.success("Upcoming bookings retrieved successfully", bookings));
    }
}

