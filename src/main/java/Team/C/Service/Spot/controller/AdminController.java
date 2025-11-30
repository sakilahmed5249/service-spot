package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.response.AdminStatisticsResponse;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.BookingResponse;
import Team.C.Service.Spot.dto.response.UserResponse;
import Team.C.Service.Spot.service.AdminService;
import Team.C.Service.Spot.service.BookingService;
import Team.C.Service.Spot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Admin operations.
 * Handles admin dashboard, user management, and system oversight.
 *
 * TODO: Add @PreAuthorize("hasRole('ADMIN')") when JWT security is implemented.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final BookingService bookingService;

    /**
     * Get comprehensive system statistics.
     *
     * @return system statistics for admin dashboard
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminStatisticsResponse>> getSystemStatistics() {
        AdminStatisticsResponse stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }

    /**
     * Get all users with optional role filter.
     *
     * @param role optional role filter (ADMIN, CUSTOMER, PROVIDER)
     * @return list of users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String role) {
        List<UserResponse> users = adminService.getAllUsers(role);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    /**
     * Get providers pending verification.
     *
     * @return list of unverified providers
     */
    @GetMapping("/users/pending-verification")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPendingVerifications() {
        List<UserResponse> providers = adminService.getPendingVerifications();
        return ResponseEntity.ok(ApiResponse.success("Pending verifications retrieved successfully", providers));
    }

    /**
     * Verify a user (provider or customer).
     *
     * @param userId user ID to verify
     * @return updated user
     */
    @PostMapping("/users/{userId}/verify")
    public ResponseEntity<ApiResponse<UserResponse>> verifyUser(@PathVariable Long userId) {
        UserResponse user = adminService.verifyUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User verified successfully", user));
    }

    /**
     * Suspend a user account.
     *
     * @param userId user ID to suspend
     * @return updated user
     */
    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<ApiResponse<UserResponse>> suspendUser(@PathVariable Long userId) {
        UserResponse user = adminService.suspendUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully", user));
    }

    /**
     * Reactivate a suspended user.
     *
     * @param userId user ID to reactivate
     * @return updated user
     */
    @PostMapping("/users/{userId}/reactivate")
    public ResponseEntity<ApiResponse<UserResponse>> reactivateUser(@PathVariable Long userId) {
        UserResponse user = adminService.reactivateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User reactivated successfully", user));
    }

    /**
     * Delete a user account.
     *
     * @param userId user ID to delete
     * @return success response
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "Deleted"));
    }

    /**
     * Get all bookings (admin view).
     *
     * @return list of all bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        // For now, we'll get a sample of bookings. In production, add pagination.
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /**
     * Get recent users.
     *
     * @param days number of days to look back (default 7)
     * @param limit maximum results (default 10)
     * @return list of recent users
     */
    @GetMapping("/users/recent")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getRecentUsers(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "10") int limit) {
        List<UserResponse> users = adminService.getRecentUsers(days, limit);
        return ResponseEntity.ok(ApiResponse.success("Recent users retrieved successfully", users));
    }
}

