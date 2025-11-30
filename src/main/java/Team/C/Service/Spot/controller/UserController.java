package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.request.UpdateUserRequest;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.UserResponse;
import Team.C.Service.Spot.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for User profile operations.
 * Handles user profile retrieval, updates, and management.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    private final UserService userService;

    /**
     * Get user profile by ID.
     * TODO: In production, get user ID from JWT token.
     *
     * @param id user ID
     * @return user profile
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", user));
    }

    /**
     * Get current user profile.
     * TODO: Extract user ID from JWT token.
     *
     * @param userId user ID (from request param temporarily)
     * @return current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestParam(required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("User ID is required", HttpStatus.BAD_REQUEST.value()));
        }

        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", user));
    }

    /**
     * Update user profile.
     * TODO: Extract user ID from JWT token and verify authorization.
     *
     * @param id user ID
     * @param request update details
     * @return updated user profile
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }

    /**
     * Delete user account.
     * TODO: Extract user ID from JWT token and verify authorization.
     *
     * @param id user ID
     * @return success response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User account deleted successfully", "Deleted"));
    }

    /**
     * Get user by email.
     *
     * @param email user email
     * @return user profile
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    /**
     * Search service providers by keyword.
     *
     * @param keyword search keyword
     * @return list of matching providers
     */
    @GetMapping("/providers/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchProviders(
            @RequestParam String keyword) {
        List<UserResponse> providers = userService.searchProviders(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", providers));
    }

    /**
     * Get list of unique cities where providers are available.
     *
     * @return list of cities
     */
    @GetMapping("/providers/locations/cities")
    public ResponseEntity<ApiResponse<List<String>>> getProviderCities() {
        List<UserResponse> providers = userService.searchProviders("");
        List<String> cities = providers.stream()
                .map(UserResponse::getCity)
                .filter(city -> city != null && !city.isEmpty())
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Provider cities retrieved successfully", cities));
    }

    /**
     * Get list of unique service types offered by providers.
     *
     * @return list of service types
     */
    @GetMapping("/providers/service-types")
    public ResponseEntity<ApiResponse<List<String>>> getProviderServiceTypes() {
        List<UserResponse> providers = userService.searchProviders("");
        List<String> serviceTypes = providers.stream()
                .map(UserResponse::getServiceType)
                .filter(type -> type != null && !type.isEmpty())
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Provider service types retrieved successfully", serviceTypes));
    }

    /**
     * Get list of unique pincodes where providers are available.
     *
     * @return list of pincodes
     */
    @GetMapping("/providers/locations/pincodes")
    public ResponseEntity<ApiResponse<List<Integer>>> getProviderPincodes() {
        List<UserResponse> providers = userService.searchProviders("");
        List<Integer> pincodes = providers.stream()
                .map(UserResponse::getPincode)
                .filter(pincode -> pincode != null)
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Provider pincodes retrieved successfully", pincodes));
    }

    /**
     * Search providers by pincode.
     *
     * @param pincode pincode to search
     * @return list of providers in that pincode
     */
    @GetMapping("/providers/pincode/{pincode}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getProvidersByPincode(
            @PathVariable Integer pincode) {
        List<UserResponse> providers = userService.searchProviders("");
        List<UserResponse> filteredProviders = providers.stream()
                .filter(provider -> pincode.equals(provider.getPincode()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Providers in pincode " + pincode + " retrieved successfully", filteredProviders));
    }

    /**
     * Search providers by city.
     *
     * @param city city name
     * @return list of providers in that city
     */
    @GetMapping("/providers/city/{city}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getProvidersByCity(
            @PathVariable String city) {
        List<UserResponse> providers = userService.searchProviders("");
        List<UserResponse> filteredProviders = providers.stream()
                .filter(provider -> city.equalsIgnoreCase(provider.getCity()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Providers in " + city + " retrieved successfully", filteredProviders));
    }

    /**
     * Delete own profile (self-deletion for customers and providers).
     * User can delete their own account.
     *
     * @param id user ID
     * @return success message
     */
    @DeleteMapping("/{id}/delete-profile")
    public ResponseEntity<ApiResponse<String>> deleteOwnProfile(@PathVariable Long id) {
        // TODO: In production, verify that JWT token user ID matches the path variable ID
        // to ensure users can only delete their own accounts

        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(
                "Your profile has been permanently deleted. All your data including bookings and reviews have been removed.",
                "Profile deleted successfully"));
    }
}


