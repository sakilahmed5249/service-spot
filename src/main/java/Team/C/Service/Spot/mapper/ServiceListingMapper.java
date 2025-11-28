package Team.C.Service.Spot.mapper;

import Team.C.Service.Spot.dto.request.CreateServiceListingRequest;
import Team.C.Service.Spot.dto.response.ServiceListingResponse;
import Team.C.Service.Spot.model.ServiceCategory;
import Team.C.Service.Spot.model.ServiceListing;
import Team.C.Service.Spot.model.User;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for ServiceListing entity and DTOs conversion.
 * Provides clean separation between domain model and API layer.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Component
public class ServiceListingMapper {

    private final UserMapper userMapper;
    private final ServiceCategoryMapper categoryMapper;

    public ServiceListingMapper(UserMapper userMapper, ServiceCategoryMapper categoryMapper) {
        this.userMapper = userMapper;
        this.categoryMapper = categoryMapper;
    }

    /**
     * Convert CreateServiceListingRequest DTO to ServiceListing entity.
     *
     * @param request the request DTO
     * @param provider the provider creating the listing
     * @param category the service category
     * @return ServiceListing entity ready for persistence
     */
    public ServiceListing toEntity(CreateServiceListingRequest request, User provider, ServiceCategory category) {
        return ServiceListing.builder()
                .provider(provider)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .currency("INR")
                .priceUnit(request.getPriceUnit())
                .durationMinutes(request.getDurationMinutes())
                .serviceLocation(request.getServiceLocation())
                .availability("Available")
                .serviceRadiusKm(request.getServiceRadiusKm())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .imageUrl(request.getImageUrl())
                .additionalImages(request.getAdditionalImages())
                .active(true)
                .featured(false)
                .totalBookings(0)
                .averageRating(0.0)
                .reviewCount(0)
                .viewCount(0)
                .build();
    }

    /**
     * Convert ServiceListing entity to ServiceListingResponse DTO.
     *
     * @param listing the ServiceListing entity
     * @return ServiceListingResponse DTO for API response
     */
    public ServiceListingResponse toResponse(ServiceListing listing) {
        if (listing == null) {
            return null;
        }

        return ServiceListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .currency(listing.getCurrency())
                .priceUnit(listing.getPriceUnit())
                .durationMinutes(listing.getDurationMinutes())
                .serviceLocation(listing.getServiceLocation())
                .availability(listing.getAvailability())
                .serviceRadiusKm(listing.getServiceRadiusKm())
                .city(listing.getCity())
                .state(listing.getState())
                .pincode(listing.getPincode())
                .imageUrl(listing.getImageUrl())
                .additionalImages(listing.getAdditionalImages())
                .active(listing.getActive())
                .featured(listing.getFeatured())
                .totalBookings(listing.getTotalBookings())
                .averageRating(listing.getAverageRating())
                .reviewCount(listing.getReviewCount())
                .viewCount(listing.getViewCount())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .provider(userMapper.toSimplifiedResponse(listing.getProvider()))
                .category(categoryMapper.toResponse(listing.getCategory()))
                .build();
    }

    /**
     * Convert ServiceListing entity to simplified response without nested objects.
     * Prevents circular references and reduces payload size.
     *
     * @param listing the ServiceListing entity
     * @return Simplified ServiceListingResponse DTO
     */
    public ServiceListingResponse toSimplifiedResponse(ServiceListing listing) {
        if (listing == null) {
            return null;
        }

        return ServiceListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .currency(listing.getCurrency())
                .city(listing.getCity())
                .state(listing.getState())
                .averageRating(listing.getAverageRating())
                .reviewCount(listing.getReviewCount())
                .imageUrl(listing.getImageUrl())
                .build();
    }
}

