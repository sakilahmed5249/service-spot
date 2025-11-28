package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.request.CustomerRegistrationRequest;
import Team.C.Service.Spot.dto.request.LoginRequest;
import Team.C.Service.Spot.dto.request.ProviderRegistrationRequest;
import Team.C.Service.Spot.dto.request.UpdateUserRequest;
import Team.C.Service.Spot.dto.response.UserResponse;
import Team.C.Service.Spot.mapper.UserMapper;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.Role;
import Team.C.Service.Spot.repository.UserRepository;
import Team.C.Service.Spot.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of UserService interface.
 * Handles all business logic for user management including registration,
 * authentication, profile updates, and provider search.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Register a new customer.
     * Validates email uniqueness, encodes password, and persists the user.
     */
    @Override
    public UserResponse registerCustomer(CustomerRegistrationRequest request) {
        log.info("Registering new customer with email: {}", request.getEmail());

        // Validate email uniqueness
        if (emailExists(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        // Validate phone uniqueness
        if (phoneExists(request.getPhone())) {
            log.error("Phone number already exists: {}", request.getPhone());
            throw new IllegalArgumentException("Phone number already exists: " + request.getPhone());
        }

        // Convert DTO to Entity
        User user = userMapper.toEntity(request);

        // Encode password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save to database
        User savedUser = userRepository.save(user);
        log.info("Successfully registered customer with ID: {}", savedUser.getId());

        // Convert to Response DTO
        return userMapper.toResponse(savedUser);
    }

    /**
     * Register a new service provider.
     * Similar to customer registration but includes provider-specific fields.
     * Automatically creates a default service listing for the provider.
     */
    @Override
    public UserResponse registerProvider(ProviderRegistrationRequest request) {
        log.info("Registering new provider with email: {}", request.getEmail());

        // Validate email uniqueness
        if (emailExists(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        // Validate phone uniqueness
        if (phoneExists(request.getPhone())) {
            log.error("Phone number already exists: {}", request.getPhone());
            throw new IllegalArgumentException("Phone number already exists: " + request.getPhone());
        }

        // Convert DTO to Entity
        User user = userMapper.toEntity(request);

        // Encode password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save to database
        User savedUser = userRepository.save(user);
        log.info("Successfully registered provider with ID: {} with service type: {}", savedUser.getId(), savedUser.getServiceType());

        // TODO: Auto-create default service listing for the provider
        // This would require ServiceListingService dependency injection
        // For now, providers will need to manually create services via "Add Service" button
        // Future enhancement: Inject ServiceListingService and create default listing here

        // Convert to Response DTO
        return userMapper.toResponse(savedUser);
    }

    /**
     * Authenticate user login.
     * Verifies email and password, returns User entity if successful.
     */
    @Override
    @Transactional(readOnly = true)
    public User authenticateUser(LoginRequest request) {
        log.info("Authenticating user with email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", request.getEmail());
                    return new IllegalArgumentException("Invalid email or password");
                });

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.error("Invalid password for user: {}", request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Check if account is active
        if (!user.getActive()) {
            log.error("Account is inactive: {}", request.getEmail());
            throw new IllegalArgumentException("Account is inactive. Please contact support.");
        }

        log.info("Successfully authenticated user: {}", request.getEmail());
        return user;
    }

    /**
     * Get user by ID.
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new IllegalArgumentException("User not found with ID: " + id);
                });

        return userMapper.toResponse(user);
    }

    /**
     * Get user entity by ID (for internal service use).
     */
    @Override
    @Transactional(readOnly = true)
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    /**
     * Get user by email.
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        log.info("Fetching user with email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new IllegalArgumentException("User not found with email: " + email);
                });

        return userMapper.toResponse(user);
    }

    /**
     * Update user profile.
     * Supports partial updates - only non-null fields are updated.
     */
    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        log.info("Updating user with ID: {}", id);

        // Find existing user
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new IllegalArgumentException("User not found with ID: " + id);
                });

        // Validate phone uniqueness if being updated
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (phoneExists(request.getPhone())) {
                log.error("Phone number already exists: {}", request.getPhone());
                throw new IllegalArgumentException("Phone number already exists: " + request.getPhone());
            }
        }

        // Update entity with new values
        userMapper.updateEntity(user, request);

        // Save updated user
        User updatedUser = userRepository.save(user);
        log.info("Successfully updated user with ID: {}", id);

        return userMapper.toResponse(updatedUser);
    }

    /**
     * Delete user account.
     * Soft delete by setting active = false, or hard delete based on business requirements.
     */
    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new IllegalArgumentException("User not found with ID: " + id);
                });

        // Soft delete - set active to false
        user.setActive(false);
        userRepository.save(user);

        // For hard delete, uncomment:
        // userRepository.deleteById(id);

        log.info("Successfully deleted user with ID: {}", id);
    }

    /**
     * Search providers by keyword (name or service type).
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> searchProviders(String keyword) {
        log.info("Searching providers with keyword: {}", keyword);

        List<User> providers = userRepository.searchProviders(keyword, Role.PROVIDER);

        return providers.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get providers by city.
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getProvidersByCity(String city) {
        log.info("Fetching providers in city: {}", city);

        List<User> providers = userRepository.findByCityAndRole(city, Role.PROVIDER);

        return providers.stream()
                .filter(User::getActive)
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get providers by service type.
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getProvidersByServiceType(String serviceType) {
        log.info("Fetching providers with service type: {}", serviceType);

        List<User> providers = userRepository.findByServiceTypeAndVerifiedAndActive(
                serviceType, true, true
        );

        return providers.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get top-rated providers in a city.
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getTopRatedProviders(String city, Double minRating) {
        log.info("Fetching top-rated providers in city: {} with min rating: {}", city, minRating);

        List<User> providers = userRepository.findTopRatedProviders(city, Role.PROVIDER, minRating);

        return providers.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Verify a provider account (admin function).
     */
    @Override
    public UserResponse verifyProvider(Long providerId) {
        log.info("Verifying provider with ID: {}", providerId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> {
                    log.error("Provider not found with ID: {}", providerId);
                    return new IllegalArgumentException("Provider not found with ID: " + providerId);
                });

        if (!provider.isProvider()) {
            log.error("User is not a provider: {}", providerId);
            throw new IllegalArgumentException("User is not a provider");
        }

        provider.setVerified(true);
        User verifiedProvider = userRepository.save(provider);

        log.info("Successfully verified provider with ID: {}", providerId);
        return userMapper.toResponse(verifiedProvider);
    }

    /**
     * Check if email already exists.
     */
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Check if phone number already exists.
     */
    @Override
    @Transactional(readOnly = true)
    public boolean phoneExists(String phone) {
        return userRepository.existsByPhone(phone);
    }
}

