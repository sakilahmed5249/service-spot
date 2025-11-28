package Team.C.Service.Spot.service;

import Team.C.Service.Spot.dto.request.CreateServiceListingRequest;
import Team.C.Service.Spot.dto.response.ServiceListingResponse;

import java.util.List;

/**
 * Service interface for ServiceListing domain operations.
 * Defines business logic for service listing management.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
public interface ServiceListingService {

    /**
     * Create a new service listing.
     *
     * @param request service listing details
     * @param providerId ID of the provider creating the listing
     * @return ServiceListingResponse DTO with created listing information
     * @throws IllegalArgumentException if provider not found or category not found
     */
    ServiceListingResponse createListing(CreateServiceListingRequest request, Long providerId);

    /**
     * Get service listing by ID.
     * Increments view count automatically.
     *
     * @param id listing ID
     * @return ServiceListingResponse DTO
     * @throws IllegalArgumentException if listing not found
     */
    ServiceListingResponse getListingById(Long id);

    /**
     * Get all service listings by provider.
     *
     * @param providerId provider ID
     * @return list of service listings
     */
    List<ServiceListingResponse> getListingsByProvider(Long providerId);

    /**
     * Get active service listings by provider.
     *
     * @param providerId provider ID
     * @return list of active service listings
     */
    List<ServiceListingResponse> getActiveListingsByProvider(Long providerId);

    /**
     * Get service listings by category.
     *
     * @param categoryId category ID
     * @return list of service listings in the category
     */
    List<ServiceListingResponse> getListingsByCategory(Long categoryId);

    /**
     * Get service listings by city.
     *
     * @param city city name
     * @return list of service listings in the city
     */
    List<ServiceListingResponse> getListingsByCity(String city);

    /**
     * Search service listings by keyword.
     * Searches in title and description.
     *
     * @param keyword search keyword
     * @return list of matching service listings
     */
    List<ServiceListingResponse> searchListings(String keyword);

    /**
     * Get all active service listings.
     *
     * @return list of all active listings (for browse services page)
     */
    List<ServiceListingResponse> getAllActiveListings();

    /**
     * Get featured service listings.
     *
     * @return list of featured active listings
     */
    List<ServiceListingResponse> getFeaturedListings();

    /**
     * Get top-rated service listings in a city.
     *
     * @param city city name
     * @param minRating minimum rating threshold
     * @return list of top-rated listings
     */
    List<ServiceListingResponse> getTopRatedListings(String city, Double minRating);

    /**
     * Get popular service listings in a city (by booking count).
     *
     * @param city city name
     * @return list of popular listings
     */
    List<ServiceListingResponse> getPopularListings(String city);

    /**
     * Update service listing.
     *
     * @param id listing ID
     * @param request update details
     * @param providerId provider ID (for authorization)
     * @return ServiceListingResponse DTO with updated information
     * @throws IllegalArgumentException if listing not found or unauthorized
     */
    ServiceListingResponse updateListing(Long id, CreateServiceListingRequest request, Long providerId);

    /**
     * Delete service listing.
     *
     * @param id listing ID
     * @param providerId provider ID (for authorization)
     * @throws IllegalArgumentException if listing not found or unauthorized
     */
    void deleteListing(Long id, Long providerId);

    /**
     * Toggle listing active status.
     *
     * @param id listing ID
     * @param providerId provider ID (for authorization)
     * @return ServiceListingResponse DTO with updated status
     * @throws IllegalArgumentException if listing not found or unauthorized
     */
    ServiceListingResponse toggleListingStatus(Long id, Long providerId);

    /**
     * Increment view count for a listing.
     *
     * @param id listing ID
     */
    void incrementViewCount(Long id);

    /**
     * Update listing rating.
     * Called after a booking is reviewed.
     *
     * @param id listing ID
     * @param newRating rating from review (1-5)
     */
    void updateRating(Long id, double newRating);
}

