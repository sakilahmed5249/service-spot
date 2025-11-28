-- ===============================
-- SERVICE-SPOT DATABASE SETUP
-- ===============================
-- This script creates the database for the Service-Spot application
-- Run this script in MySQL Workbench or MySQL Command Line

-- Create the database
CREATE DATABASE IF NOT EXISTS servicespot
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE servicespot;

-- Display confirmation message
SELECT 'Database servicespot created successfully!' AS Status;

-- Show all databases to confirm
SHOW DATABASES;

