package Team.C.Service.Spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import Team.C.Service.Spot.model.ServiceListing;
import Team.C.Service.Spot.model.ServiceCategory;
import Team.C.Service.Spot.model.User;

import java.util.List;

/**
 * Repository interface for ServiceListing entity operations.
 * Provides CRUD operations and custom query methods for service listing management.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Repository
public interface ServiceListingRepository extends JpaRepository<ServiceListing, Long> {

    /**
     * Find all active service listings.
     *
     * @param active the active status
     * @return list of active listings
     */
    List<ServiceListing> findByActive(Boolean active);

    /**
     * Find all service listings by provider.
     *
     * @param provider the provider user
     * @return list of listings by the provider
     */
    List<ServiceListing> findByProvider(User provider);

    /**
     * Find active service listings by provider.
     *
     * @param provider the provider user
     * @param active the active status
     * @return list of active listings by the provider
     */
    List<ServiceListing> findByProviderAndActive(User provider, Boolean active);

    /**
     * Find service listings by category.
     *
     * @param category the service category
     * @return list of listings in the category
     */
    List<ServiceListing> findByCategory(ServiceCategory category);

    /**
     * Find active service listings by category.
     *
     * @param category the service category
     * @param active the active status
     * @return list of active listings in the category
     */
    List<ServiceListing> findByCategoryAndActive(ServiceCategory category, Boolean active);

    /**
     * Find service listings by city.
     *
     * @param city the city name
     * @return list of listings in the city
     */
    List<ServiceListing> findByCity(String city);

    /**
     * Find active service listings by city.
     *
     * @param city the city name
     * @param active the active status
     * @return list of active listings in the city
     */
    List<ServiceListing> findByCityAndActive(String city, Boolean active);

    /**
     * Find service listings by city and category.
     *
     * @param city the city name
     * @param category the service category
     * @param active the active status
     * @return list of matching listings
     */
    List<ServiceListing> findByCityAndCategoryAndActive(
        String city,
        ServiceCategory category,
        Boolean active
    );

    /**
     * Find featured service listings.
     *
     * @param featured the featured status
     * @param active the active status
     * @return list of featured active listings
     */
    List<ServiceListing> findByFeaturedAndActive(Boolean featured, Boolean active);

    /**
     * Search service listings by keyword in title or description.
     *
     * @param keyword the search keyword
     * @return list of matching listings
     */
    @Query("SELECT s FROM ServiceListing s WHERE s.active = true AND " +
           "(LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ServiceListing> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Find top-rated service listings in a city.
     *
     * @param city the city name
     * @param minRating minimum rating threshold
     * @return list of top-rated listings
     */
    @Query("SELECT s FROM ServiceListing s WHERE s.city = :city " +
           "AND s.active = true AND s.averageRating >= :minRating " +
           "ORDER BY s.averageRating DESC, s.reviewCount DESC")
    List<ServiceListing> findTopRatedInCity(
        @Param("city") String city,
        @Param("minRating") Double minRating
    );

    /**
     * Find service listings within a price range.
     *
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param active the active status
     * @return list of listings within price range
     */
    List<ServiceListing> findByPriceBetweenAndActive(
        Double minPrice,
        Double maxPrice,
        Boolean active
    );

    /**
     * Find most popular service listings (by booking count).
     *
     * @param city the city name
     * @return list of popular listings
     */
    @Query("SELECT s FROM ServiceListing s WHERE s.city = :city " +
           "AND s.active = true ORDER BY s.totalBookings DESC, s.averageRating DESC")
    List<ServiceListing> findPopularInCity(@Param("city") String city);

    /**
     * Count active listings by provider.
     *
     * @param provider the provider user
     * @param active the active status
     * @return count of active listings
     */
    long countByProviderAndActive(User provider, Boolean active);

    /**
     * Count listings by category.
     *
     * @param category the service category
     * @return count of listings in category
     */
    long countByCategory(ServiceCategory category);
}

