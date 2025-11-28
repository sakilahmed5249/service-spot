package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.request.CustomerRegistrationRequest;
import Team.C.Service.Spot.dto.request.LoginRequest;
import Team.C.Service.Spot.dto.request.ProviderRegistrationRequest;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.AuthResponse;
import Team.C.Service.Spot.dto.response.UserResponse;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Authentication operations.
 * Handles user registration (customer and provider) and login.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final UserService userService;

    /**
     * Register a new customer.
     *
     * @param request customer registration details
     * @return registered user information
     */
    @PostMapping("/register/customer")
    public ResponseEntity<ApiResponse<UserResponse>> registerCustomer(
            @Valid @RequestBody CustomerRegistrationRequest request) {
        UserResponse user = userService.registerCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registered successfully", user));
    }

    /**
     * Register a new service provider.
     *
     * @param request provider registration details
     * @return registered provider information
     */
    @PostMapping("/register/provider")
    public ResponseEntity<ApiResponse<UserResponse>> registerProvider(
            @Valid @RequestBody ProviderRegistrationRequest request) {
        UserResponse user = userService.registerProvider(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service provider registered successfully", user));
    }

    /**
     * User login.
     * TODO: Generate JWT token in production.
     *
     * @param request login credentials
     * @return authentication response with user details and token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        User user = userService.authenticateUser(request);

        // TODO: Generate actual JWT token
        String mockToken = "mock-jwt-token-" + user.getId();

        // Map User to UserResponse with ALL fields including provider-specific ones
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .doorNo(user.getDoorNo())
                .addressLine(user.getAddressLine())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .active(user.getActive())
                // Provider-specific fields
                .serviceType(user.getServiceType())
                .approxPrice(user.getApproxPrice())
                .yearsExperience(user.getYearsExperience())
                .description(user.getDescription())
                .verified(user.getVerified())
                .averageRating(user.getAverageRating())
                .reviewCount(user.getReviewCount())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .token(mockToken)
                .tokenType("Bearer")
                .expiresIn(86400000L) // 24 hours
                .user(userResponse)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    /**
     * Logout endpoint.
     * Currently does nothing as JWT is stateless.
     * In production, could invalidate token or add to blacklist.
     *
     * @return success response
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful", "Logged out"));
    }

    /**
     * Verify token (placeholder).
     * TODO: Implement JWT token verification.
     *
     * @param token JWT token
     * @return token validation response
     */
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyToken(@RequestParam String token) {
        // TODO: Implement JWT verification
        boolean isValid = token != null && token.startsWith("mock-jwt-token-");
        return ResponseEntity.ok(ApiResponse.success("Token verification completed", isValid));
    }
}

