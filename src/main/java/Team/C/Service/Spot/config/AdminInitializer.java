package Team.C.Service.Spot.config;

import Team.C.Service.Spot.model.User;
import Team.C.Service.Spot.model.enums.Role;
import Team.C.Service.Spot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes the default admin account on application startup if it doesn't exist.
 *
 * PRODUCTION DEPLOYMENT:
 * Set these environment variables:
 * - ADMIN_EMAIL (default: admin@servicespot.com)
 * - ADMIN_PASSWORD (default: Admin@123)
 * - ADMIN_NAME (default: System Administrator)
 * - ADMIN_PHONE (default: 9999999999)
 *
 * Example:
 * export ADMIN_EMAIL=admin@yourcompany.com
 * export ADMIN_PASSWORD=YourSecurePassword123!
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@servicespot.com}")
    private String adminEmail;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;

    @Value("${admin.name:System Administrator}")
    private String adminName;

    @Value("${admin.phone:9999999999}")
    private String adminPhone;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin already exists
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("✅ Admin account already exists: {}", adminEmail);
            return;
        }

        // Create default admin account
        log.info("🔧 Creating admin account...");

        // Encode password
        String encodedPassword = passwordEncoder.encode(adminPassword);
        log.debug("Password encoded successfully (BCrypt hash length: {})", encodedPassword.length());

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(encodedPassword)
                .phone(adminPhone)
                .doorNo("Admin")
                .addressLine("ServiceSpot Headquarters")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode(400001)
                .role(Role.ADMIN)
                .active(true)
                .verified(true)
                .build();

        userRepository.save(admin);

        log.info("✅ Admin account created successfully!");
        log.info("   Email: {}", adminEmail);
        if ("Admin@123".equals(adminPassword)) {
            log.warn("⚠️  WARNING: Using default password! Change it in production!");
            log.warn("⚠️  Set ADMIN_PASSWORD environment variable for production deployment.");
        }

        // Verify the password encoding works
        if (passwordEncoder.matches(adminPassword, encodedPassword)) {
            log.info("   ✅ Password encoding verified - login will work!");
        } else {
            log.error("   ❌ Password encoding verification FAILED!");
        }
    }
}

