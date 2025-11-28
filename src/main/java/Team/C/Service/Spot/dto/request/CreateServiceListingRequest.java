package Team.C.Service.Spot.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateServiceListingRequest {

    // Category ID - optional, can use category name instead
    private Long categoryId;

    // Category name - for flexible category input
    @Size(max = 50, message = "Category name must not exceed 50 characters")
    private String categoryName;

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private Double price;

    @Size(max = 50, message = "Price unit must not exceed 50 characters")
    private String priceUnit;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @Size(max = 50, message = "Service location must not exceed 50 characters")
    private String serviceLocation;

    @Min(value = 1, message = "Service radius must be at least 1 km")
    @Max(value = 100, message = "Service radius cannot exceed 100 km")
    private Integer serviceRadiusKm;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotNull(message = "Pincode is required")
    @Min(value = 100000, message = "Pincode must be 6 digits")
    @Max(value = 999999, message = "Pincode must be 6 digits")
    private Integer pincode;

    private String imageUrl;

    private String additionalImages;
}