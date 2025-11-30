package Team.C.Service.Spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import Team.C.Service.Spot.model.Booking;
import Team.C.Service.Spot.model.ServiceListing;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.BookingStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Booking entity operations.
 * Provides CRUD operations and custom query methods for booking management.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Find a booking by its reference number.
     *
     * @param bookingReference the unique booking reference
     * @return Optional containing the booking if found
     */
    Optional<Booking> findByBookingReference(String bookingReference);

    /**
     * Find all bookings by customer.
     *
     * @param customer the customer user
     * @return list of customer's bookings
     */
    List<Booking> findByCustomer(User customer);

    /**
     * Find all bookings by provider.
     *
     * @param provider the provider user
     * @return list of provider's bookings
     */
    List<Booking> findByProvider(User provider);

    /**
     * Find bookings by customer and status.
     *
     * @param customer the customer user
     * @param status the booking status
     * @return list of matching bookings
     */
    List<Booking> findByCustomerAndStatus(User customer, BookingStatus status);

    /**
     * Find bookings by provider and status.
     *
     * @param provider the provider user
     * @param status the booking status
     * @return list of matching bookings
     */
    List<Booking> findByProviderAndStatus(User provider, BookingStatus status);

    /**
     * Find bookings by service listing.
     *
     * @param serviceListing the service listing
     * @return list of bookings for the service
     */
    List<Booking> findByServiceListing(ServiceListing serviceListing);

    /**
     * Find bookings by status.
     *
     * @param status the booking status
     * @return list of bookings with the specified status
     */
    List<Booking> findByStatus(BookingStatus status);

    /**
     * Find bookings by booking date.
     *
     * @param bookingDate the date
     * @return list of bookings on that date
     */
    List<Booking> findByBookingDate(LocalDate bookingDate);

    /**
     * Find provider's bookings for a specific date.
     *
     * @param provider the provider user
     * @param bookingDate the date
     * @return list of bookings
     */
    List<Booking> findByProviderAndBookingDate(User provider, LocalDate bookingDate);

    /**
     * Find customer's upcoming bookings.
     *
     * @param customer the customer user
     * @param currentDate today's date
     * @return list of future bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer " +
           "AND b.bookingDate >= :currentDate " +
           "AND b.status NOT IN ('CANCELLED', 'REJECTED', 'COMPLETED') " +
           "ORDER BY b.bookingDate ASC, b.bookingTime ASC")
    List<Booking> findUpcomingByCustomer(
        @Param("customer") User customer,
        @Param("currentDate") LocalDate currentDate
    );

    /**
     * Find provider's upcoming bookings.
     *
     * @param provider the provider user
     * @param currentDate today's date
     * @return list of future bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.provider = :provider " +
           "AND b.bookingDate >= :currentDate " +
           "AND b.status NOT IN ('CANCELLED', 'REJECTED') " +
           "ORDER BY b.bookingDate ASC, b.bookingTime ASC")
    List<Booking> findUpcomingByProvider(
        @Param("provider") User provider,
        @Param("currentDate") LocalDate currentDate
    );

    /**
     * Find customer's past bookings.
     *
     * @param customer the customer user
     * @param currentDate today's date
     * @return list of past bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer " +
           "AND (b.bookingDate < :currentDate OR b.status IN ('COMPLETED', 'CANCELLED', 'REJECTED')) " +
           "ORDER BY b.bookingDate DESC, b.bookingTime DESC")
    List<Booking> findPastByCustomer(
        @Param("customer") User customer,
        @Param("currentDate") LocalDate currentDate
    );

    /**
     * Find provider's pending booking requests.
     *
     * @param provider the provider user
     * @param status the booking status (PENDING)
     * @return list of pending requests
     */
    @Query("SELECT b FROM Booking b WHERE b.provider = :provider " +
           "AND b.status = :status ORDER BY b.createdAt DESC")
    List<Booking> findPendingRequestsByProvider(
        @Param("provider") User provider,
        @Param("status") BookingStatus status
    );

    /**
     * Count bookings by customer.
     *
     * @param customer the customer user
     * @return total number of bookings
     */
    long countByCustomer(User customer);

    /**
     * Count bookings by provider.
     *
     * @param provider the provider user
     * @return total number of bookings
    /**
     * Count bookings by provider.
     *
     * @param provider the provider user
     * @return count of provider's bookings
     */
    long countByProvider(User provider);

    /**
     * Count bookings by provider and status.
     *
     * @param provider the provider user
     * @param status the booking status
     * @return count of bookings with the status
     */
    long countByProviderAndStatus(User provider, BookingStatus status);

    /**
     * Count bookings by status.
     *
     * @param status the booking status
     * @return count of bookings with the status
     */
    long countByStatus(BookingStatus status);

    /**
     * Find bookings by status after a certain date.
     *
     * @param status the booking status
     * @param createdAt the date to filter from
     * @return list of bookings
     */
    List<Booking> findByStatusAndCreatedAtAfter(BookingStatus status, java.time.LocalDateTime createdAt);

    /**
     * Calculate total revenue from bookings.
     *
     * @param provider the provider user
     * @param status the booking status (typically COMPLETED)
     * @return total amount from completed bookings
     */
    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.provider = :provider " +
           "AND b.status = :status")
    Double calculateTotalRevenue(
        @Param("provider") User provider,
        @Param("status") BookingStatus status
    );

    /**
     * Find bookings by date range.
     *
     * @param startDate start of date range
     * @param endDate end of date range
     * @return list of bookings within the range
     */
    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Check if customer has existing booking for a service.
     *
     * @param customer the customer
     * @param serviceListing the service listing
     * @param bookingDate the booking date
     * @return true if booking exists
     */
    boolean existsByCustomerAndServiceListingAndBookingDate(
        User customer,
        ServiceListing serviceListing,
        LocalDate bookingDate
    );
}

