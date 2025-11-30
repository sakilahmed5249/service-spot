package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.request.AdminRegistrationRequest;
import Team.C.Service.Spot.dto.request.CustomerRegistrationRequest;
import Team.C.Service.Spot.dto.request.LoginRequest;
import Team.C.Service.Spot.dto.request.ProviderRegistrationRequest;
import Team.C.Service.Spot.dto.request.UpdateUserRequest;
import Team.C.Service.Spot.dto.response.UserResponse;
import Team.C.Service.Spot.model.User;

import java.util.List;

/**
 * Service interface for User domain operations.
 * Defines business logic for user management including registration, authentication, and updates.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
public interface UserService {

    /**
     * Register a new admin.
     *
     * @param request admin registration details
     * @return UserResponse DTO with created admin information
     * @throws IllegalArgumentException if email already exists
     */
    UserResponse registerAdmin(AdminRegistrationRequest request);

    /**
     * Register a new customer.
     *
     * @param request customer registration details
     * @return UserResponse DTO with created user information
     * @throws IllegalArgumentException if email already exists
     */
    UserResponse registerCustomer(CustomerRegistrationRequest request);

    /**
     * Register a new service provider.
     *
     * @param request provider registration details
     * @return UserResponse DTO with created provider information
     * @throws IllegalArgumentException if email already exists
     */
    UserResponse registerProvider(ProviderRegistrationRequest request);

    /**
     * Authenticate user login.
     *
     * @param request login credentials
     * @return User entity if authentication successful
     * @throws IllegalArgumentException if credentials are invalid
     */
    User authenticateUser(LoginRequest request);

    /**
     * Get user by ID.
     *
     * @param id user ID
     * @return UserResponse DTO
     * @throws IllegalArgumentException if user not found
     */
    UserResponse getUserById(Long id);

    /**
     * Get user entity by ID (for internal use).
     *
     * @param id user ID
     * @return User entity
     * @throws IllegalArgumentException if user not found
     */
    User getUserEntityById(Long id);

    /**
     * Get user by email.
     *
     * @param email user email
     * @return UserResponse DTO
     * @throws IllegalArgumentException if user not found
     */
    UserResponse getUserByEmail(String email);

    /**
     * Update user profile.
     *
     * @param id user ID
     * @param request update details
     * @return UserResponse DTO with updated information
     * @throws IllegalArgumentException if user not found
     */
    UserResponse updateUser(Long id, UpdateUserRequest request);

    /**
     * Delete user account.
     *
     * @param id user ID
     * @throws IllegalArgumentException if user not found
     */
    void deleteUser(Long id);

    /**
     * Search providers by keyword (name or service type).
     *
     * @param keyword search keyword
     * @return list of matching providers
     */
    List<UserResponse> searchProviders(String keyword);

    /**
     * Get providers by city.
     *
     * @param city city name
     * @return list of providers in the city
     */
    List<UserResponse> getProvidersByCity(String city);

    /**
     * Get providers by service type.
     *
     * @param serviceType service type
     * @return list of providers offering the service
     */
    List<UserResponse> getProvidersByServiceType(String serviceType);

    /**
     * Get top-rated providers in a city.
     *
     * @param city city name
     * @param minRating minimum rating threshold
     * @return list of top-rated providers
     */
    List<UserResponse> getTopRatedProviders(String city, Double minRating);

    /**
     * Verify a provider account (admin function).
     *
     * @param providerId provider ID
     * @return UserResponse DTO with updated verification status
     * @throws IllegalArgumentException if provider not found
     */
    UserResponse verifyProvider(Long providerId);

    /**
     * Check if email already exists.
     *
     * @param email email to check
     * @return true if email exists, false otherwise
     */
    boolean emailExists(String email);

    /**
     * Check if phone number already exists.
     *
     * @param phone phone number to check
     * @return true if phone exists, false otherwise
     */
    boolean phoneExists(String phone);
}

