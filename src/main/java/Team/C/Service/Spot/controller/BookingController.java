package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.request.CreateBookingRequest;
import Team.C.Service.Spot.dto.request.UpdateBookingStatusRequest;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.model.enums.BookingStatus;
import Team.C.Service.Spot.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Booking operations.
 * Handles booking creation, retrieval, status updates, and cancellations.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking.
     *
     * @param request booking creation request
     * @return created booking details
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", booking));
    }

    /**
     * Get booking by ID.
     *
     * @param id booking ID
     * @return booking details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", booking));
    }

    /**
     * Get bookings by user (customer or provider).
     * Uses query parameters to filter by userId and role.
     *
     * @param userId user ID
     * @param role user role (CUSTOMER or PROVIDER)
     * @return list of bookings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByUser(
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "CUSTOMER") String role) {
        List<BookingResponse> bookings = bookingService.getBookingsByUser(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /**
     * Get bookings by customer ID.
     *
     * @param customerId customer ID
     * @return list of customer bookings
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByCustomer(
            @PathVariable Long customerId) {
        List<BookingResponse> bookings = bookingService.getBookingsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer bookings retrieved successfully", bookings));
    }

    /**
     * Get bookings by provider ID.
     *
     * @param providerId provider ID
     * @return list of provider bookings
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByProvider(
            @PathVariable Long providerId) {
        List<BookingResponse> bookings = bookingService.getBookingsByProvider(providerId);
        return ResponseEntity.ok(ApiResponse.success("Provider bookings retrieved successfully", bookings));
    }

    /**
     * Get bookings by service listing ID.
     *
     * @param serviceId service listing ID
     * @return list of bookings
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByService(
            @PathVariable Long serviceId) {
        List<BookingResponse> bookings = bookingService.getBookingsByServiceListing(serviceId);
        return ResponseEntity.ok(ApiResponse.success("Service bookings retrieved successfully", bookings));
    }

    /**
     * Get bookings by status.
     *
     * @param status booking status
     * @return list of bookings
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByStatus(
            @PathVariable BookingStatus status) {
        List<BookingResponse> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /**
     * Update booking status.
     * Frontend sends PATCH with {status: "CONFIRMED", providerNotes: "..."}
     *
     * @param id booking ID
     * @param request status update request
     * @return updated booking
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingStatusRequest request) {
        BookingResponse booking = bookingService.updateBookingStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", booking));
    }

    /**
     * Cancel booking.
     * This is an alternative endpoint for explicit cancellations.
     *
     * @param id booking ID
     * @param cancelledBy who cancelled (customer/provider)
     * @param reason cancellation reason
     * @return updated booking
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @RequestParam String cancelledBy,
            @RequestParam(required = false) String reason) {
        BookingResponse booking = bookingService.cancelBooking(id, cancelledBy, reason);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    /**
     * Delete booking.
     * Hard delete - use with caution.
     *
     * @param id booking ID
     * @return success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking deleted successfully", null));
    }
}

