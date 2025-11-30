package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.request.CreateBookingRequest;
import Team.C.Service.Spot.dto.request.UpdateBookingStatusRequest;
import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.model.enums.BookingStatus;

import java.util.List;

/**
 * Service interface for Booking operations.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
public interface BookingService {

    /**
     * Create a new booking
     *
     * @param request booking creation request
     * @return created booking response
     */
    BookingResponse createBooking(CreateBookingRequest request);

    /**
     * Get booking by ID
     *
     * @param id booking ID
     * @return booking response
     */
    BookingResponse getBookingById(Long id);

    /**
     * Get all bookings (admin view)
     *
     * @return list of all bookings
     */
    List<BookingResponse> getAllBookings();

    /**
     * Get all bookings for a user (customer or provider)
     *
     * @param userId user ID
     * @param role user role (CUSTOMER or PROVIDER)
     * @return list of bookings
     */
    List<BookingResponse> getBookingsByUser(Long userId, String role);

    /**
     * Get bookings by customer ID
     *
     * @param customerId customer ID
     * @return list of bookings
     */
    List<BookingResponse> getBookingsByCustomer(Long customerId);

    /**
     * Get bookings by provider ID
     *
     * @param providerId provider ID
     * @return list of bookings
     */
    List<BookingResponse> getBookingsByProvider(Long providerId);

    /**
     * Get bookings by service listing ID
     *
     * @param serviceListingId service listing ID
     * @return list of bookings
     */
    List<BookingResponse> getBookingsByServiceListing(Long serviceListingId);

    /**
     * Get bookings by status
     *
     * @param status booking status
     * @return list of bookings
     */
    List<BookingResponse> getBookingsByStatus(BookingStatus status);

    /**
     * Update booking status
     *
     * @param id booking ID
     * @param request status update request
     * @return updated booking response
     */
    BookingResponse updateBookingStatus(Long id, UpdateBookingStatusRequest request);

    /**
     * Cancel booking
     *
     * @param id booking ID
     * @param cancelledBy who cancelled (customer/provider)
     * @param reason cancellation reason
     * @return updated booking response
     */
    BookingResponse cancelBooking(Long id, String cancelledBy, String reason);

    /**
     * Delete booking (soft delete)
     *
     * @param id booking ID
     */
    void deleteBooking(Long id);
}

