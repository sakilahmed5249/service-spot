package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceListingResponse {

    private Long id;
    private String title;
    private String description;
    private Double price;
    private String currency;
    private String priceUnit;
    private Integer durationMinutes;
    private String serviceLocation;
    private String availability;
    private Integer serviceRadiusKm;

    private String city;
    private String state;
    private Integer pincode;

    private String imageUrl;
    private String additionalImages;

    private Boolean active;
    private Boolean featured;
    private Integer totalBookings;
    private Double averageRating;
    private Integer reviewCount;
    private Integer viewCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UserResponse provider;
    private ServiceCategoryResponse category;

    public String getFormattedPrice() {
        return String.format("%.2f %s", price, currency);
    }

    public String getFullLocation() {
        return String.format("%s, %s - %d", city, state, pincode);
    }
}

