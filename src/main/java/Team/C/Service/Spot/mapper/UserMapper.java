package Team.C.Service.Spot.mapper;

import Team.C.Service.Spot.dto.request.CustomerRegistrationRequest;
import Team.C.Service.Spot.dto.request.ProviderRegistrationRequest;
import Team.C.Service.Spot.dto.request.UpdateUserRequest;
import Team.C.Service.Spot.dto.response.UserResponse;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.Role;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for User entity and DTOs conversion.
 * Provides clean separation between domain model and API layer.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Component
public class UserMapper {

    /**
     * Convert CustomerRegistrationRequest DTO to User entity.
     * Sets role to CUSTOMER and initializes default values.
     *
     * @param request the registration request DTO
     * @return User entity ready for persistence
     */
    public User toEntity(CustomerRegistrationRequest request) {
        return User.builder()
                .role(Role.CUSTOMER)
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
                .doorNo(request.getDoorNo())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .active(true)
                .emailVerified(false)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
    }

    /**
     * Convert ProviderRegistrationRequest DTO to User entity.
     * Sets role to PROVIDER and includes provider-specific fields.
     *
     * @param request the registration request DTO
     * @return User entity ready for persistence
     */
    public User toEntity(ProviderRegistrationRequest request) {
        return User.builder()
                .role(Role.PROVIDER)
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
                .doorNo(request.getDoorNo())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .serviceType(request.getServiceType())
                .approxPrice(request.getApproxPrice())
                .description(request.getDescription())
                .yearsExperience(request.getYearsExperience() != null ? request.getYearsExperience() : 0)
                .verified(false)
                .active(true)
                .emailVerified(false)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
    }

    /**
     * Convert User entity to UserResponse DTO.
     * Excludes sensitive information like password.
     *
     * @param user the User entity
     * @return UserResponse DTO for API response
     */
    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .doorNo(user.getDoorNo())
                .addressLine(user.getAddressLine())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .serviceType(user.getServiceType())
                .verified(user.getVerified())
                .approxPrice(user.getApproxPrice())
                .description(user.getDescription())
                .yearsExperience(user.getYearsExperience())
                .averageRating(user.getAverageRating())
                .reviewCount(user.getReviewCount())
                .active(user.getActive())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Update User entity with data from UpdateUserRequest DTO.
     * Only updates non-null fields to support partial updates.
     *
     * @param user the existing User entity
     * @param request the update request DTO
     */
    public void updateEntity(User user, UpdateUserRequest request) {
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getDoorNo() != null) {
            user.setDoorNo(request.getDoorNo());
        }
        if (request.getAddressLine() != null) {
            user.setAddressLine(request.getAddressLine());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getState() != null) {
            user.setState(request.getState());
        }
        if (request.getPincode() != null) {
            user.setPincode(request.getPincode());
        }

        // Provider-specific fields
        if (user.isProvider()) {
            if (request.getServiceType() != null) {
                user.setServiceType(request.getServiceType());
            }
            if (request.getApproxPrice() != null) {
                user.setApproxPrice(request.getApproxPrice());
            }
            if (request.getDescription() != null) {
                user.setDescription(request.getDescription());
            }
            if (request.getYearsExperience() != null) {
                user.setYearsExperience(request.getYearsExperience());
            }
        }
    }

    /**
     * Convert User entity to simplified UserResponse for nested objects.
     * Excludes detailed information to prevent circular references.
     *
     * @param user the User entity
     * @return Simplified UserResponse DTO
     */
    public UserResponse toSimplifiedResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .city(user.getCity())
                .state(user.getState())
                .serviceType(user.getServiceType())
                .verified(user.getVerified())
                .averageRating(user.getAverageRating())
                .reviewCount(user.getReviewCount())
                .build();
    }
}


