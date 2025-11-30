package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.dto.response.CustomerStatisticsResponse;
import Team.C.Service.Spot.mapper.BookingMapper;
import Team.C.Service.Spot.model.Booking;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.BookingStatus;
import Team.C.Service.Spot.repository.BookingRepository;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of CustomerService.
 * Provides customer-specific operations and statistics.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional(readOnly = true)
    public CustomerStatisticsResponse getCustomerStatistics(Long customerId) {
        log.info("Fetching statistics for customer ID: {}", customerId);

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + customerId));

        List<Booking> allBookings = bookingRepository.findByCustomer(customer);

        // Booking counts
        Long totalBookings = (long) allBookings.size();
        Long activeBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED ||
                           b.getStatus() == BookingStatus.IN_PROGRESS)
                .count();
        Long completedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();
        Long cancelledBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        // Upcoming bookings (future bookings that aren't completed/cancelled)
        LocalDate today = LocalDate.now();
        Long upcomingBookings = allBookings.stream()
                .filter(b -> b.getBookingDate() != null &&
                           b.getBookingDate().isAfter(today) &&
                           (b.getStatus() == BookingStatus.PENDING ||
                            b.getStatus() == BookingStatus.CONFIRMED))
                .count();

        // Financial statistics
        List<Booking> completedBookingsList = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());

        Double totalSpent = completedBookingsList.stream()
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0.0)
                .sum();

        Double averageBookingValue = completedBookings > 0 ?
                totalSpent / completedBookings : 0.0;

        // This month spending
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        Double thisMonthSpent = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED &&
                           b.getCompletedAt() != null &&
                           b.getCompletedAt().isAfter(startOfMonth))
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0.0)
                .sum();

        // Last month spending
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusDays(1);
        Double lastMonthSpent = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED &&
                           b.getCompletedAt() != null &&
                           b.getCompletedAt().isAfter(startOfLastMonth) &&
                           b.getCompletedAt().isBefore(endOfLastMonth))
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0.0)
                .sum();

        // Service statistics
        Long uniqueServicesBooked = allBookings.stream()
                .map(b -> b.getServiceListing().getId())
                .distinct()
                .count();

        Long favoriteProvidersCount = 0L; // TODO: Implement favorites when that feature is added

        // Pending reviews (completed bookings without reviews)
        Long pendingReviews = (long) completedBookingsList.size(); // TODO: Filter by actual review status

        // Activity
        String lastBookingDate = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null)
                .max(Comparator.comparing(Booking::getCreatedAt))
                .map(b -> b.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .orElse("Never");

        String memberSince = customer.getCreatedAt() != null ?
                customer.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : "Unknown";

        Long reviewsWritten = 0L; // TODO: Implement when review system is in place

        return CustomerStatisticsResponse.builder()
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .upcomingBookings(upcomingBookings)
                .totalSpent(totalSpent)
                .averageBookingValue(averageBookingValue)
                .thisMonthSpent(thisMonthSpent)
                .lastMonthSpent(lastMonthSpent)
                .uniqueServicesBooked(uniqueServicesBooked)
                .favoriteProvidersCount(favoriteProvidersCount)
                .pendingReviews(pendingReviews)
                .lastBookingDate(lastBookingDate)
                .memberSince(memberSince)
                .reviewsWritten(reviewsWritten)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getRecentBookings(Long customerId, int limit) {
        log.info("Fetching recent {} bookings for customer ID: {}", limit, customerId);

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + customerId));

        List<Booking> bookings = bookingRepository.findByCustomer(customer);

        return bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .limit(limit)
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUpcomingBookings(Long customerId) {
        log.info("Fetching upcoming bookings for customer ID: {}", customerId);

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + customerId));

        List<Booking> bookings = bookingRepository.findUpcomingByCustomer(customer, LocalDate.now());

        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }
}

