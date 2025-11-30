package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.response.AdminStatisticsResponse;
import Team.C.Service.Spot.dto.response.UserResponse;

import java.util.List;

/**
 * Service interface for Admin operations.
 * Handles admin-specific functionality including statistics,
 * user management, and system oversight.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
public interface AdminService {

    /**
     * Get comprehensive system statistics for admin dashboard.
     *
     * @return admin statistics
     */
    AdminStatisticsResponse getSystemStatistics();

    /**
     * Get all users with optional role filter.
     *
     * @param role optional role filter (ADMIN, CUSTOMER, PROVIDER)
     * @return list of users
     */
    List<UserResponse> getAllUsers(String role);

    /**
     * Get all providers pending verification.
     *
     * @return list of unverified providers
     */
    List<UserResponse> getPendingVerifications();

    /**
     * Verify a user (provider or customer).
     *
     * @param userId user ID to verify
     * @return updated user
     */
    UserResponse verifyUser(Long userId);

    /**
     * Suspend a user account.
     *
     * @param userId user ID to suspend
     * @return updated user
     */
    UserResponse suspendUser(Long userId);

    /**
     * Reactivate a suspended user account.
     *
     * @param userId user ID to reactivate
     * @return updated user
     */
    UserResponse reactivateUser(Long userId);

    /**
     * Get recently registered users.
     *
     * @param days number of days to look back
     * @param limit maximum number of results
     * @return list of recent users
     */
    List<UserResponse> getRecentUsers(int days, int limit);
}

