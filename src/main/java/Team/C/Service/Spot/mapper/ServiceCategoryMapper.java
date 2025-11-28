package Team.C.Service.Spot.mapper;

import Team.C.Service.Spot.dto.response.ServiceCategoryResponse;
import Team.C.Service.Spot.model.ServiceCategory;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for ServiceCategory entity and DTOs conversion.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-28
 */
@Component
public class ServiceCategoryMapper {

    /**
     * Convert ServiceCategory entity to ServiceCategoryResponse DTO.
     *
     * @param category the ServiceCategory entity
     * @return ServiceCategoryResponse DTO for API response
     */
    public ServiceCategoryResponse toResponse(ServiceCategory category) {
        if (category == null) {
            return null;
        }

        return ServiceCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .slug(category.getSlug())
                .active(category.getActive())
                .displayOrder(category.getDisplayOrder())
                .createdAt(category.getCreatedAt())
                .activeListingsCount(category.getActiveListingsCount())
                .build();
    }
}

