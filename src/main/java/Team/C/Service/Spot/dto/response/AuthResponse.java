package Team.C.Service.Spot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response DTO.
 * Contains JWT tokens and user information.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;           // Access token
    private String refreshToken;    // Refresh token for obtaining new access token
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn;         // Token expiration time in milliseconds
    private UserResponse user;

    public AuthResponse(String token, Long expiresIn, UserResponse user) {
        this.token = token;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.user = user;
    }
}

