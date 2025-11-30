package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.response.AdminStatisticsResponse;
import Team.C.Service.Spot.dto.response.UserResponse;
import Team.C.Service.Spot.mapper.UserMapper;
import Team.C.Service.Spot.model.Booking;
import Team.C.Service.Spot.model.ServiceListing;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.BookingStatus;
import Team.C.Service.Spot.model.enums.Role;
import Team.C.Service.Spot.repository.BookingRepository;
import Team.C.Service.Spot.repository.ServiceListingRepository;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of AdminService.
 * Provides admin-specific operations for system management.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ServiceListingRepository serviceListingRepository;
    private final UserMapper userMapper;

    @Override
    public AdminStatisticsResponse getSystemStatistics() {
        log.info("Fetching system statistics for admin dashboard");

        // User Statistics
        Long totalUsers = userRepository.count();
        Long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        Long totalProviders = userRepository.countByRole(Role.PROVIDER);
        Long totalAdmins = userRepository.countByRole(Role.ADMIN);

        List<User> providers = userRepository.findByRole(Role.PROVIDER);
        Long verifiedProviders = providers.stream().filter(User::getVerified).count();
        Long pendingVerifications = providers.stream().filter(p -> !p.getVerified()).count();
        Long activeUsers = userRepository.findAll().stream().filter(User::getActive).count();
        Long suspendedUsers = userRepository.findAll().stream().filter(u -> !u.getActive()).count();

        // Booking Statistics
        Long totalBookings = bookingRepository.count();
        Long activeBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED) +
                             bookingRepository.countByStatus(BookingStatus.IN_PROGRESS);
        Long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        Long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        Long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        Long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        Long inProgressBookings = bookingRepository.countByStatus(BookingStatus.IN_PROGRESS);

        // Revenue Statistics
        List<Booking> completedBookingsList = bookingRepository.findByStatus(BookingStatus.COMPLETED);
        Double totalRevenue = completedBookingsList.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        List<Booking> monthlyBookings = bookingRepository.findByStatusAndCreatedAtAfter(
                BookingStatus.COMPLETED, startOfMonth);
        Double monthlyRevenue = monthlyBookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0.0;

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        List<Booking> todayBookingsList = bookingRepository.findByStatusAndCreatedAtAfter(
                BookingStatus.COMPLETED, startOfDay);
        Double todayRevenue = todayBookingsList.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        // Service Statistics
        Long totalServices = serviceListingRepository.count();
        Long activeServices = serviceListingRepository.findAll().stream()
                .filter(ServiceListing::getActive)
                .count();
        Long featuredServices = 0L; // TODO: Add featured field if needed

        // Recent Activity
        Long todayBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt().isAfter(startOfDay))
                .count();

        Long todayRegistrations = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfDay))
                .count();

        Long todayCompletedBookings = (long) todayBookingsList.size();

        return AdminStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalProviders(totalProviders)
                .totalAdmins(totalAdmins)
                .verifiedProviders(verifiedProviders)
                .pendingVerifications(pendingVerifications)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .inProgressBookings(inProgressBookings)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .averageBookingValue(averageBookingValue)
                .todayRevenue(todayRevenue)
                .totalServices(totalServices)
                .activeServices(activeServices)
                .featuredServices(featuredServices)
                .todayBookings(todayBookings)
                .todayRegistrations(todayRegistrations)
                .todayCompletedBookings(todayCompletedBookings)
                .build();
    }

    @Override
    public List<UserResponse> getAllUsers(String role) {
        log.info("Fetching all users with role filter: {}", role);

        List<User> users;
        if (role != null && !role.isEmpty()) {
            try {
                Role roleEnum = Role.valueOf(role.toUpperCase());
                users = userRepository.findByRole(roleEnum);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role filter: {}, fetching all users", role);
                users = userRepository.findAll();
            }
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getPendingVerifications() {
        log.info("Fetching providers pending verification");

        List<User> providers = userRepository.findByRole(Role.PROVIDER);
        return providers.stream()
                .filter(p -> !p.getVerified())
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse verifyUser(Long userId) {
        log.info("Verifying user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        user.setVerified(true);
        User savedUser = userRepository.save(user);

        log.info("User {} (role: {}) successfully verified", userId, user.getRole());
        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse suspendUser(Long userId) {
        log.info("Suspending user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        user.setActive(false);
        User savedUser = userRepository.save(user);

        log.info("User {} successfully suspended", userId);
        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse reactivateUser(Long userId) {
        log.info("Reactivating user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        user.setActive(true);
        User savedUser = userRepository.save(user);

        log.info("User {} successfully reactivated", userId);
        return userMapper.toResponse(savedUser);
    }

    @Override
    public List<UserResponse> getRecentUsers(int days, int limit) {
        log.info("Fetching recent users from last {} days, limit: {}", days, limit);

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(since))
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(limit)
                .collect(Collectors.toList());

        return users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }
}

