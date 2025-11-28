package Team.C.Service.Spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.Role;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 * Provides CRUD operations and custom query methods for user management.
 *
 * <p>This repository handles both customers and providers through the unified User entity.</p>
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by email address (used for authentication).
     *
     * @param email the email address to search for
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user exists with the given email.
     *
     * @param email the email address to check
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Check if a user exists with the given phone number.
     *
     * @param phone the phone number to check
     * @return true if user exists, false otherwise
     */
    boolean existsByPhone(String phone);

    /**
     * Find all users by role.
     *
     * @param role the role to filter by (CUSTOMER or PROVIDER)
     * @return list of users with the specified role
     */
    List<User> findByRole(Role role);

    /**
     * Find all active users by role.
     *
     * @param role the role to filter by
     * @param active the active status
     * @return list of active users with the specified role
     */
    List<User> findByRoleAndActive(Role role, Boolean active);

    /**
     * Find providers by city (for location-based search).
     *
     * @param city the city name
     * @param role the role (should be PROVIDER)
     * @return list of providers in the specified city
     */
    List<User> findByCityAndRole(String city, Role role);

    /**
     * Find verified providers by service type.
     *
     * @param serviceType the service type to search for
     * @param verified verification status
     * @param active active status
     * @return list of verified active providers offering the service type
     */
    List<User> findByServiceTypeAndVerifiedAndActive(
        String serviceType,
        Boolean verified,
        Boolean active
    );

    /**
     * Find providers by city and service type (location + service based search).
     *
     * @param city the city name
     * @param serviceType the service type
     * @param role the role (PROVIDER)
     * @param verified verification status
     * @param active active status
     * @return list of matching providers
     */
    List<User> findByCityAndServiceTypeAndRoleAndVerifiedAndActive(
        String city,
        String serviceType,
        Role role,
        Boolean verified,
        Boolean active
    );

    /**
     * Search providers by name or service type (for search functionality).
     *
     * @param keyword the search keyword
     * @param role the role (PROVIDER)
     * @return list of matching providers
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.serviceType) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchProviders(@Param("keyword") String keyword, @Param("role") Role role);

    /**
     * Find top-rated providers in a city.
     *
     * @param city the city name
     * @param role the role (PROVIDER)
     * @param minRating minimum rating threshold
     * @return list of top-rated providers
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.city = :city " +
           "AND u.averageRating >= :minRating AND u.active = true " +
           "ORDER BY u.averageRating DESC, u.reviewCount DESC")
    List<User> findTopRatedProviders(
        @Param("city") String city,
        @Param("role") Role role,
        @Param("minRating") Double minRating
    );

    /**
     * Count total users by role.
     *
     * @param role the role to count
     * @return number of users with the specified role
     */
    long countByRole(Role role);

    /**
     * Count verified providers.
     *
     * @param role the role (PROVIDER)
     * @param verified verification status
     * @return number of verified providers
     */
    long countByRoleAndVerified(Role role, Boolean verified);
}

