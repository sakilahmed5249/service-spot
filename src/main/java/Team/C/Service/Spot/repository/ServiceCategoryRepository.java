package Team.C.Service.Spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import Team.C.Service.Spot.model.ServiceCategory;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ServiceCategory entity operations.
 * Provides CRUD operations and custom query methods for category management.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {

    /**
     * Find a category by its name.
     *
     * @param name the category name
     * @return Optional containing the category if found
     */
    Optional<ServiceCategory> findByName(String name);

    /**
     * Find a category by its slug.
     *
     * @param slug the URL-friendly slug
     * @return Optional containing the category if found
     */
    Optional<ServiceCategory> findBySlug(String slug);

    /**
     * Check if a category exists with the given name.
     *
     * @param name the category name
     * @return true if exists, false otherwise
     */
    boolean existsByName(String name);

    /**
     * Find all active categories.
     *
     * @param active the active status
     * @return list of active categories
     */
    List<ServiceCategory> findByActive(Boolean active);

    /**
     * Find all active categories ordered by display order.
     *
     * @param active the active status
     * @return list of categories sorted by display order
     */
    List<ServiceCategory> findByActiveOrderByDisplayOrderAsc(Boolean active);

    /**
     * Find all categories ordered by name.
     *
     * @return list of all categories sorted alphabetically
     */
    List<ServiceCategory> findAllByOrderByNameAsc();
}

