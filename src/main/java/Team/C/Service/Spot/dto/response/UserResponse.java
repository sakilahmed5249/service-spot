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
public class UserResponse {

    private Long id;
    private String role;
    private String name;
    private String email;
    private String phone;
    private String doorNo;
    private String addressLine;
    private String city;
    private String state;
    private Integer pincode;

    private String serviceType;
    private Boolean verified;
    private Double approxPrice;
    private String description;
    private Integer yearsExperience;
    private Double averageRating;
    private Integer reviewCount;

    private Boolean active;
    private Boolean emailVerified;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getFullAddress() {
        return String.format("%s, %s, %s, %s - %d",
                doorNo, addressLine, city, state, pincode);
    }
}