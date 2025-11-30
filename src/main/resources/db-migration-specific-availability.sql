-- =====================================================
-- SPECIFIC AVAILABILITY TABLE MIGRATION
-- =====================================================
--
-- IMPORTANT: You DON'T need to run this script manually!
--
-- Spring Boot with Hibernate (ddl-auto=update) will automatically
-- create this table from the SpecificAvailability.java entity.
--
-- Just restart your backend:
--   cd C:\Users\Ahmed\OneDrive\Desktop\service-spotV4
--   mvn spring-boot:run
--
-- The table will be created automatically!
--
-- =====================================================
-- If you want to create it manually (OPTIONAL):
-- =====================================================

-- This script creates the specific_availability table for date-based availability
-- Only run this if Hibernate auto-creation is disabled or you want manual control

CREATE TABLE IF NOT EXISTS specific_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    service_listing_id BIGINT,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    max_bookings INT,
    current_bookings INT NOT NULL DEFAULT 0,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign keys will be added after tables exist
    INDEX idx_provider_date (provider_id, available_date),
    INDEX idx_service_date (service_listing_id, available_date),
    INDEX idx_provider_service (provider_id, service_listing_id),
    INDEX idx_available_date (available_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints (run after all tables are created)
-- Note: Hibernate will create these automatically

-- ALTER TABLE specific_availability
--     ADD CONSTRAINT fk_specific_avail_provider
--     FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE specific_availability
--     ADD CONSTRAINT fk_specific_avail_service
--     FOREIGN KEY (service_listing_id) REFERENCES service_listings(id) ON DELETE CASCADE;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- After backend starts, verify table exists:
-- SELECT * FROM specific_availability;
-- DESCRIBE specific_availability;


