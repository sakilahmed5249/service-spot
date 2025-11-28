-- ==================================================
-- Insert Default Service Categories
-- Run this in MySQL Workbench if data.sql doesn't auto-execute
-- ==================================================

USE service_spot;

-- Insert service categories
INSERT INTO service_categories (name, description, icon, active, created_at, display_order) VALUES
('Education', 'Education and tutoring services', '📚', 1, NOW(), 1),
('Plumbing', 'Plumbing and pipe services', '🔧', 1, NOW(), 2),
('Electrical', 'Electrical services and repairs', '⚡', 1, NOW(), 3),
('Cleaning', 'Cleaning and housekeeping services', '🧹', 1, NOW(), 4),
('Beauty', 'Beauty and wellness services', '💇', 1, NOW(), 5),
('IT Support', 'IT and tech support services', '💻', 1, NOW(), 6),
('Home Repair', 'Home repair and maintenance', '🏠', 1, NOW(), 7),
('Health', 'Health and medical services', '🏥', 1, NOW(), 8),
('Carpentry', 'Carpentry and woodwork', '🪚', 1, NOW(), 9),
('Painting', 'Painting services', '🎨', 1, NOW(), 10)
ON DUPLICATE KEY UPDATE name=name;

-- Verify insertion
SELECT * FROM service_categories;

