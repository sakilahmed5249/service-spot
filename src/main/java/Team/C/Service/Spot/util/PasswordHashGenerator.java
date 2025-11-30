package Team.C.Service.Spot.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility to generate BCrypt password hash for admin account
 * Run this class to generate a new password hash
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Admin@123";
        String hash = encoder.encode(password);

        System.out.println("========================================");
        System.out.println("Password Hash Generator");
        System.out.println("========================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("========================================");
        System.out.println("\nSQL to insert admin:");
        System.out.println("INSERT INTO users (name, email, password, phone, door_no, address_line, city, state, pincode, role, active, verified, created_at, updated_at)");
        System.out.println("VALUES ('System Administrator', 'admin@servicespot.com', '" + hash + "', '9999999999', 'Admin', 'ServiceSpot Headquarters', 'Mumbai', 'Maharashtra', '400001', 'ADMIN', true, true, NOW(), NOW());");
        System.out.println("========================================");
    }
}

