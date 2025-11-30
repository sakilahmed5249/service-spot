package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.request.CreateBookingRequest;
import Team.C.Service.Spot.dto.request.UpdateBookingStatusRequest;
import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.mapper.BookingMapper;
import Team.C.Service.Spot.model.Booking;
import Team.C.Service.Spot.model.ServiceListing;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.BookingStatus;
import Team.C.Service.Spot.repository.BookingRepository;
import Team.C.Service.Spot.repository.ServiceListingRepository;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of BookingService interface.
 * Handles all business logic for booking management.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceListingRepository serviceListingRepository;
    private final BookingMapper bookingMapper;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {
        log.info("Creating booking for customer ID: {} and service ID: {}",
                request.getCustomerId(), request.getServiceListingId());

        // Validate that booking datetime is in the future
        LocalDateTime bookingDateTime = LocalDateTime.of(request.getBookingDate(), request.getBookingTime());
        if (bookingDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Booking date and time must be in the future");
        }

        // Fetch customer
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Customer not found with ID: " + request.getCustomerId()));

        // Fetch service listing
        ServiceListing serviceListing = serviceListingRepository.findById(request.getServiceListingId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Service listing not found with ID: " + request.getServiceListingId()));

        // Get provider from service listing
        User provider = serviceListing.getProvider();

        // Create booking entity
        Booking booking = Booking.builder()
                .customer(customer)
                .provider(provider)
                .serviceListing(serviceListing)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .durationMinutes(request.getDurationMinutes())
                .serviceDoorNo(request.getServiceDoorNo())
                .serviceAddressLine(request.getServiceAddressLine())
                .serviceCity(request.getServiceCity())
                .serviceState(request.getServiceState())
                .servicePincode(request.getServicePincode())
                .totalAmount(serviceListing.getPrice())
                .currency("INR")
                .paymentStatus("Pending")
                .paymentMethod(request.getPaymentMethod())
                .customerNotes(request.getCustomerNotes())
                .status(BookingStatus.PENDING)
                .build();

        // Generate booking reference
        booking.setBookingReference(generateBookingReference());

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Successfully created booking with ID: {} and reference: {}",
                savedBooking.getId(), savedBooking.getBookingReference());

        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        log.info("Fetching booking by ID: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + id));
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        log.info("Fetching all bookings for admin view");
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUser(Long userId, String role) {
        log.info("Fetching bookings for user ID: {} with role: {}", userId, role);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        List<Booking> bookings;
        if ("PROVIDER".equalsIgnoreCase(role)) {
            bookings = bookingRepository.findByProvider(user);
        } else {
            bookings = bookingRepository.findByCustomer(user);
        }

        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomer(Long customerId) {
        log.info("Fetching bookings for customer ID: {}", customerId);
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + customerId));

        List<Booking> bookings = bookingRepository.findByCustomer(customer);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByProvider(Long providerId) {
        log.info("Fetching bookings for provider ID: {}", providerId);
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + providerId));

        List<Booking> bookings = bookingRepository.findByProvider(provider);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByServiceListing(Long serviceListingId) {
        log.info("Fetching bookings for service listing ID: {}", serviceListingId);
        ServiceListing serviceListing = serviceListingRepository.findById(serviceListingId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Service listing not found with ID: " + serviceListingId));

        List<Booking> bookings = bookingRepository.findByServiceListing(serviceListing);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        log.info("Fetching bookings with status: {}", status);
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse updateBookingStatus(Long id, UpdateBookingStatusRequest request) {
        log.info("Updating booking status for ID: {} to {}", id, request.getStatus());

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + id));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(request.getStatus());
        booking.setProviderNotes(request.getProviderNotes());

        // Update timestamps based on status
        LocalDateTime now = LocalDateTime.now();
        switch (request.getStatus()) {
            case CONFIRMED:
                booking.setConfirmedAt(now);
                break;
            case COMPLETED:
                booking.setCompletedAt(now);
                break;
            case CANCELLED:
                booking.setCancelledAt(now);
                booking.setCancellationReason(request.getCancellationReason());
                booking.setCancelledBy(request.getCancelledBy());
                break;
            default:
                break;
        }

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Successfully updated booking status from {} to {}", oldStatus, request.getStatus());

        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public BookingResponse cancelBooking(Long id, String cancelledBy, String reason) {
        log.info("Cancelling booking ID: {} by {}", id, cancelledBy);

        UpdateBookingStatusRequest request = UpdateBookingStatusRequest.builder()
                .status(BookingStatus.CANCELLED)
                .cancelledBy(cancelledBy)
                .cancellationReason(reason)
                .build();

        return updateBookingStatus(id, request);
    }

    @Override
    public void deleteBooking(Long id) {
        log.info("Deleting booking with ID: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + id));

        bookingRepository.delete(booking);
        log.info("Successfully deleted booking with ID: {}", id);
    }

    /**
     * Generate a unique booking reference number
     * Format: BK-YYYY-NNNNNN
     */
    private String generateBookingReference() {
        String year = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = bookingRepository.count() + 1;
        return String.format("BK-%s-%06d", year, count);
    }
}

