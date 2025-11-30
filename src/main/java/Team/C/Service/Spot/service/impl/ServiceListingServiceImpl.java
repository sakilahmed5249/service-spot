package Team.C.Service.Spot.service.impl;

import Team.C.Service.Spot.dto.request.CreateServiceListingRequest;
import Team.C.Service.Spot.dto.response.ServiceListingResponse;
import Team.C.Service.Spot.mapper.ServiceListingMapper;
import Team.C.Service.Spot.model.ServiceCategory;
import Team.C.Service.Spot.model.ServiceListing;
import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.repository.ServiceCategoryRepository;
import Team.C.Service.Spot.repository.ServiceListingRepository;
import Team.C.Service.Spot.service.ServiceListingService;
import Team.C.Service.Spot.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ServiceListingService interface.
 * Handles all business logic for service listing management.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceListingServiceImpl implements ServiceListingService {

    private final ServiceListingRepository listingRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final ServiceListingMapper listingMapper;
    private final UserService userService;

    /**
     * Create a new service listing.
     */
    @Override
    public ServiceListingResponse createListing(CreateServiceListingRequest request, Long providerId) {
        log.info("Creating new service listing for provider ID: {}", providerId);

        // Get provider (validates existence and throws exception if not found)
        User provider = userService.getUserEntityById(providerId);

        // Validate that user is a provider
        if (!provider.isProvider()) {
            log.error("User is not a provider: {}", providerId);
            throw new IllegalArgumentException("Only providers can create service listings");
        }

        // Handle category - either use existing ID or create/find by name
        ServiceCategory category;
        if (request.getCategoryId() != null) {
            // Use provided category ID
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> {
                        log.error("Category not found with ID: {}", request.getCategoryId());
                        return new IllegalArgumentException("Category not found with ID: " + request.getCategoryId());
                    });
        } else if (request.getCategoryName() != null && !request.getCategoryName().trim().isEmpty()) {
            // Find or create category by name
            String categoryName = request.getCategoryName().trim();
            category = categoryRepository.findByName(categoryName)
                    .orElseGet(() -> {
                        log.info("Creating new category: {}", categoryName);
                        ServiceCategory newCategory = ServiceCategory.builder()
                                .name(categoryName)
                                .description(categoryName + " services")
                                .icon("🔧")
                                .active(true)
                                .build();
                        return categoryRepository.save(newCategory);
                    });
        } else {
            log.error("Neither categoryId nor categoryName provided");
            throw new IllegalArgumentException("Either categoryId or categoryName must be provided");
        }

        // Convert DTO to Entity
        ServiceListing listing = listingMapper.toEntity(request, provider, category);

        // Save to database
        ServiceListing savedListing = listingRepository.save(listing);
        log.info("Successfully created service listing with ID: {}", savedListing.getId());

        // Convert to Response DTO
        return listingMapper.toResponse(savedListing);
    }

    /**
     * Get service listing by ID.
     * Automatically increments view count.
     */
    @Override
    @Transactional
    public ServiceListingResponse getListingById(Long id) {
        log.info("Fetching service listing with ID: {}", id);

        ServiceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service listing not found with ID: {}", id);
                    return new IllegalArgumentException("Service listing not found with ID: " + id);
                });

        // Increment view count
        listing.incrementViewCount();
        listingRepository.save(listing);

        return listingMapper.toResponse(listing);
    }

    /**
     * Get all service listings by provider.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getListingsByProvider(Long providerId) {
        log.info("Fetching all listings for provider ID: {}", providerId);

        User provider = userService.getUserEntityById(providerId);
        List<ServiceListing> listings = listingRepository.findByProvider(provider);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active service listings by provider.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getActiveListingsByProvider(Long providerId) {
        log.info("Fetching active listings for provider ID: {}", providerId);

        User provider = userService.getUserEntityById(providerId);
        List<ServiceListing> listings = listingRepository.findByProviderAndActive(provider, true);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get service listings by category.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getListingsByCategory(Long categoryId) {
        log.info("Fetching listings for category ID: {}", categoryId);

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));

        List<ServiceListing> listings = listingRepository.findByCategoryAndActive(category, true);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get service listings by city.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getListingsByCity(String city) {
        log.info("Fetching listings in city: {}", city);

        List<ServiceListing> listings = listingRepository.findByCityAndActive(city, true);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search service listings by keyword.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> searchListings(String keyword) {
        log.info("Searching listings with keyword: {}", keyword);

        List<ServiceListing> listings = listingRepository.searchByKeyword(keyword);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active service listings.
     * Used for browse services page to show all available services.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getAllActiveListings() {
        log.info("Fetching all active listings");

        List<ServiceListing> listings = listingRepository.findByActive(true);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get featured service listings only.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getFeaturedListings() {
        log.info("Fetching featured listings");

        List<ServiceListing> listings = listingRepository.findByFeaturedAndActive(true, true);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get top-rated service listings in a city.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getTopRatedListings(String city, Double minRating) {
        log.info("Fetching top-rated listings in city: {} with min rating: {}", city, minRating);

        List<ServiceListing> listings = listingRepository.findTopRatedInCity(city, minRating);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get popular service listings in a city.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceListingResponse> getPopularListings(String city) {
        log.info("Fetching popular listings in city: {}", city);

        List<ServiceListing> listings = listingRepository.findPopularInCity(city);

        return listings.stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update service listing.
     */
    @Override
    public ServiceListingResponse updateListing(Long id, CreateServiceListingRequest request, Long providerId) {
        log.info("Updating service listing ID: {} by provider ID: {}", id, providerId);

        // Find existing listing
        ServiceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service listing not found with ID: {}", id);
                    return new IllegalArgumentException("Service listing not found with ID: " + id);
                });

        // Verify ownership
        if (!listing.belongsToProvider(providerId)) {
            log.error("Provider {} does not own listing {}", providerId, id);
            throw new IllegalArgumentException("You do not have permission to update this listing");
        }

        // Get category if being updated
        if (request.getCategoryId() != null) {
            ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            listing.setCategory(category);
        }

        // Update fields
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setPriceUnit(request.getPriceUnit());
        listing.setDurationMinutes(request.getDurationMinutes());
        listing.setServiceLocation(request.getServiceLocation());
        listing.setServiceRadiusKm(request.getServiceRadiusKm());
        listing.setCity(request.getCity());
        listing.setState(request.getState());
        listing.setPincode(request.getPincode());
        listing.setImageUrl(request.getImageUrl());
        listing.setAdditionalImages(request.getAdditionalImages());

        // Save updated listing
        ServiceListing updatedListing = listingRepository.save(listing);
        log.info("Successfully updated service listing with ID: {}", id);

        return listingMapper.toResponse(updatedListing);
    }

    /**
     * Delete service listing.
     */
    @Override
    public void deleteListing(Long id, Long providerId) {
        log.info("Deleting service listing ID: {} by provider ID: {}", id, providerId);

        // Find existing listing
        ServiceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service listing not found with ID: {}", id);
                    return new IllegalArgumentException("Service listing not found with ID: " + id);
                });

        // Verify ownership
        if (!listing.belongsToProvider(providerId)) {
            log.error("Provider {} does not own listing {}", providerId, id);
            throw new IllegalArgumentException("You do not have permission to delete this listing");
        }

        // Hard delete - permanently remove from database
        listingRepository.deleteById(id);

        // Note: Soft delete option (commented out for reference):
        // listing.setActive(false);
        // listingRepository.save(listing);

        log.info("Successfully hard deleted service listing with ID: {}", id);
    }

    /**
     * Toggle listing active status.
     */
    @Override
    public ServiceListingResponse toggleListingStatus(Long id, Long providerId) {
        log.info("Toggling status for listing ID: {} by provider ID: {}", id, providerId);

        ServiceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service listing not found with ID: " + id));

        // Verify ownership
        if (!listing.belongsToProvider(providerId)) {
            throw new IllegalArgumentException("You do not have permission to modify this listing");
        }

        // Toggle status
        listing.setActive(!listing.getActive());
        ServiceListing updatedListing = listingRepository.save(listing);

        log.info("Successfully toggled status for listing ID: {} to {}", id, updatedListing.getActive());
        return listingMapper.toResponse(updatedListing);
    }

    /**
     * Increment view count for a listing.
     */
    @Override
    public void incrementViewCount(Long id) {
        listingRepository.findById(id).ifPresent(listing -> {
            listing.incrementViewCount();
            listingRepository.save(listing);
        });
    }

    /**
     * Update listing rating after a review.
     */
    @Override
    public void updateRating(Long id, double newRating) {
        log.info("Updating rating for listing ID: {} with new rating: {}", id, newRating);

        ServiceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service listing not found with ID: " + id));

        listing.updateRating(newRating);
        listingRepository.save(listing);

        log.info("Successfully updated rating for listing ID: {}", id);
    }
}

