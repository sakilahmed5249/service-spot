-- Insert default service categories
INSERT INTO service_categories (name, description, icon, active, created_at, display_order) VALUES
('Education', 'Education and tutoring services', 'EDU', true, NOW(), 1),
('Plumbing', 'Plumbing and pipe services', 'PLB', true, NOW(), 2),
('Electrical', 'Electrical services and repairs', 'ELE', true, NOW(), 3),
('Cleaning', 'Cleaning and housekeeping services', 'CLN', true, NOW(), 4),
('Beauty', 'Beauty and wellness services', 'BTY', true, NOW(), 5),
('IT Support', 'IT and tech support services', 'IT', true, NOW(), 6),
('Home Repair', 'Home repair and maintenance', 'HMR', true, NOW(), 7),
('Health', 'Health and medical services', 'HLT', true, NOW(), 8),
('Carpentry', 'Carpentry and woodwork', 'CRP', true, NOW(), 9),
('Painting', 'Painting services', 'PNT', true, NOW(), 10)
ON DUPLICATE KEY UPDATE name=name;

