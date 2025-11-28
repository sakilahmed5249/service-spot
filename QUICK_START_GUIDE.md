# Service-Spot Backend - Quick Start Guide

## ✅ What We've Built So Far

### ✓ Core Domain Model (Complete)
- **User Entity**: Unified customer & provider model with role-based differentiation
- **ServiceListing Entity**: Service offerings with pricing, location, and ratings
- **ServiceCategory Entity**: Service classification system
- **Booking Entity**: Complete booking lifecycle management
- **Enums**: Role (CUSTOMER, PROVIDER) and BookingStatus (6 states)

### ✓ Data Access Layer (Complete)
- **UserRepository**: 15+ query methods including advanced search
- **ServiceListingRepository**: 20+ methods for service discovery
- **ServiceCategoryRepository**: Category management queries
- **BookingRepository**: 25+ methods for booking operations

### ✓ Configuration (Complete)
- **pom.xml**: All dependencies configured (Web, JPA, Security, JWT, Validation, Lombok)
- **application.properties**: Database, JPA, JWT, and logging configuration

---

## 🔨 Entity Quick Reference

### User Entity Properties

#### Common Fields (Both Roles):
```java
Long id
Role role                    // CUSTOMER or PROVIDER
String email                 // Unique, used for login
String password              // BCrypt hashed
String name
String phone                 // Unique
String doorNo
String addressLine
String city
String state
Integer pincode
Boolean active
Boolean emailVerified
LocalDateTime createdAt
LocalDateTime updatedAt
```

#### Provider-Only Fields:
```java
String serviceType          // e.g., "Plumbing", "Electrical"
Boolean verified           // Admin verification status
Double approxPrice         // Base service price
String description         // Business description
Integer yearsExperience
Double averageRating      // 0.0 to 5.0
Integer reviewCount
```

### ServiceListing Entity Properties
```java
Long id
User provider              // FK to User (role=PROVIDER)
ServiceCategory category   // FK to ServiceCategory
String title
String description
Double price
String currency           // Default: "INR"
String priceUnit          // e.g., "per hour"
Integer durationMinutes
String serviceLocation    // "On-site", "Remote", "Both"
String city
String state
Integer pincode
Boolean active
Boolean featured
Integer totalBookings
Double averageRating
Integer reviewCount
Integer viewCount
LocalDateTime createdAt
LocalDateTime updatedAt
```

### Booking Entity Properties
```java
Long id
String bookingReference    // e.g., "BK-2025-001234"
User customer              // FK to User (role=CUSTOMER)
User provider              // FK to User (role=PROVIDER)
ServiceListing serviceListing  // FK to ServiceListing
LocalDate bookingDate
LocalTime bookingTime
BookingStatus status       // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED
String serviceDoorNo       // Service location (may differ from customer address)
String serviceAddressLine
String serviceCity
String serviceState
Integer servicePincode
Double totalAmount
String paymentStatus       // "Pending", "Paid", "Refunded"
String paymentMethod       // "Cash", "Card", "UPI"
String customerNotes
String providerNotes
String cancellationReason
LocalDateTime createdAt
LocalDateTime confirmedAt
LocalDateTime completedAt
LocalDateTime cancelledAt
```

---

## 🔍 Repository Method Examples

### UserRepository
```java
// Find by email (login)
Optional<User> findByEmail(String email)

// Check if email exists
boolean existsByEmail(String email)

// Get all providers
List<User> findByRole(Role.PROVIDER)

// Find providers in a city
List<User> findByCityAndRole("Bangalore", Role.PROVIDER)

// Search providers by keyword
List<User> searchProviders("plumb", Role.PROVIDER)

// Find top-rated providers
List<User> findTopRatedProviders("Mumbai", Role.PROVIDER, 4.0)
```

### ServiceListingRepository
```java
// Find provider's services
List<ServiceListing> findByProvider(provider)

// Find active services in a city
List<ServiceListing> findByCityAndActive("Delhi", true)

// Find by category
List<ServiceListing> findByCategoryAndActive(category, true)

// Search by keyword
List<ServiceListing> searchByKeyword("plumbing")

// Find top-rated in city
List<ServiceListing> findTopRatedInCity("Chennai", 4.0)

// Find popular services
List<ServiceListing> findPopularInCity("Hyderabad")
```

### BookingRepository
```java
// Find by booking reference
Optional<Booking> findByBookingReference("BK-2025-001234")

// Customer's bookings
List<Booking> findByCustomer(customer)

// Provider's bookings
List<Booking> findByProvider(provider)

// Find by status
List<Booking> findByCustomerAndStatus(customer, BookingStatus.PENDING)

// Upcoming bookings
List<Booking> findUpcomingByCustomer(customer, LocalDate.now())

// Pending requests for provider
List<Booking> findPendingRequestsByProvider(provider, BookingStatus.PENDING)

// Calculate revenue
Double calculateTotalRevenue(provider, BookingStatus.COMPLETED)
```

---

## 🎯 Key Relationships

```
User (Provider) ──1:N──> ServiceListing ──N:1──> ServiceCategory
       │                        │
       │                        │
       │                     1:N│
       │                        ▼
       └──────1:N──────>  Booking  <──N:1── User (Customer)
```

### Relationship Details:
1. **User → ServiceListing**: One provider has many service listings
2. **ServiceListing → User**: Many listings belong to one provider
3. **ServiceCategory → ServiceListing**: One category contains many listings
4. **User (Customer) → Booking**: One customer makes many bookings
5. **User (Provider) → Booking**: One provider receives many bookings
6. **ServiceListing → Booking**: One listing can have many bookings

---

## 🚦 Booking Lifecycle

```
PENDING ──accept──> CONFIRMED ──start──> IN_PROGRESS ──complete──> COMPLETED
   │                    │
   │                    │
   └──reject──> REJECTED
   │                    │
   └──cancel──> CANCELLED <──cancel──┘
```

### Status Transitions:
- **PENDING**: Initial state when customer creates booking
- **CONFIRMED**: Provider accepts the request
- **IN_PROGRESS**: Service is being performed
- **COMPLETED**: Service finished successfully
- **CANCELLED**: Cancelled by customer or provider
- **REJECTED**: Provider declines the request

---

## 📝 What to Build Next

### Phase 1: Service Layer
```java
@Service
public class UserService {
    // registerCustomer(CustomerRegistrationDTO)
    // registerProvider(ProviderRegistrationDTO)
    // updateProfile(Long id, UpdateUserDTO)
    // getProvidersByCity(String city)
    // searchProviders(SearchCriteria)
}

@Service
public class AuthService {
    // login(email, password) -> JWT Token
    // refreshToken(String refreshToken) -> New JWT
    // validateToken(String token) -> Boolean
    // logout(String token)
}

@Service
public class ServiceListingService {
    // createListing(CreateListingDTO)
    // updateListing(Long id, UpdateListingDTO)
    // searchServices(SearchFilters)
    // getServiceDetails(Long id)
    // incrementViewCount(Long id)
}

@Service
public class BookingService {
    // createBooking(CreateBookingDTO)
    // confirmBooking(Long id)
    // cancelBooking(Long id, String reason)
    // completeBooking(Long id)
    // getCustomerBookings(Long customerId)
    // getProviderBookings(Long providerId)
}
```

### Phase 2: DTOs (Data Transfer Objects)
```java
// Request DTOs
public class CustomerRegistrationDTO {
    String name, email, password, phone, address...
}

public class ProviderRegistrationDTO {
    String name, email, password, phone, address...
    String serviceType;
    Double approxPrice;
    String description;
    Integer yearsExperience;
}

public class CreateBookingDTO {
    Long serviceListingId;
    LocalDate bookingDate;
    LocalTime bookingTime;
    String serviceAddress;
    String customerNotes;
}

// Response DTOs
public class UserResponseDTO {
    Long id, String name, email, phone, city...
    // Exclude password
}

public class ServiceListingResponseDTO {
    Long id, String title, description, price...
    UserResponseDTO provider;
    CategoryResponseDTO category;
}
```

### Phase 3: Controllers
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/signup/customer")
    @PostMapping("/signup/provider")
    @PostMapping("/login")
    @PostMapping("/refresh")
    @PostMapping("/logout")
}

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @GetMapping
    @GetMapping("/{id}")
    @PostMapping
    @PutMapping("/{id}")
    @DeleteMapping("/{id}")
    @GetMapping("/search")
}

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @PostMapping
    @GetMapping("/{id}")
    @PatchMapping("/{id}/confirm")
    @PatchMapping("/{id}/cancel")
    @PatchMapping("/{id}/complete")
    @GetMapping("/my-bookings")
}
```

### Phase 4: Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // JWT filter
    // Password encoder (BCrypt)
    // Public endpoints: /api/auth/**, /api/services (GET)
    // Protected endpoints: /api/bookings/**, /api/services (POST/PUT/DELETE)
}
```

---

## 🛠️ Development Commands

### Build & Run:
```bash
# Clean build
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Skip tests
./mvnw clean install -DskipTests
```

### Database:
```sql
-- View all tables
SHOW TABLES;

-- Check users
SELECT * FROM users;

-- Check service listings
SELECT * FROM service_listings;

-- Check bookings
SELECT * FROM bookings;
```

---

## 📊 Validation Examples

### User Validation:
- Email: Valid email format, unique
- Phone: 10-15 digits, unique
- Password: Min 8 characters (add custom validator)
- Pincode: 6 digits (100000-999999)
- Name: 2-100 characters

### ServiceListing Validation:
- Title: 5-100 characters
- Description: 20-2000 characters
- Price: > 0
- Duration: >= 1 minute

### Booking Validation:
- Booking date: Must be in future
- Total amount: >= 0
- Address fields: Not blank

---

## 🎨 Sample Data for Testing

### Sample Categories:
```sql
INSERT INTO service_categories (name, description, icon, slug, active, display_order) VALUES
('Home Repair', 'Plumbing, Electrical, Carpentry', 'wrench', 'home-repair', true, 1),
('Cleaning Services', 'Home cleaning, Office cleaning', 'broom', 'cleaning-services', true, 2),
('Beauty & Wellness', 'Salon, Spa, Massage', 'spa', 'beauty-wellness', true, 3),
('Event Services', 'Photography, Catering, Decoration', 'camera', 'event-services', true, 4);
```

### Sample Provider:
```sql
INSERT INTO users (role, email, password, name, phone, door_no, address_line, city, state, pincode,
                   service_type, verified, approx_price, years_experience, active)
VALUES ('PROVIDER', 'john.plumber@example.com', '$2a$10$...', 'John Plumbing Services',
        '9876543210', '123', 'MG Road', 'Bangalore', 'Karnataka', 560001,
        'Plumbing', true, 500.00, 10, true);
```

---

## 🔐 Security Notes

### ⚠️ Important:
1. **Password Hashing**: Use BCrypt with strength 10-12
2. **JWT Secret**: Change the default secret in production
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: All inputs are validated with Bean Validation
5. **SQL Injection**: Protected by JPA parameterized queries
6. **CORS**: Configure allowed origins properly

---

## 📚 Resources

- Spring Boot Docs: https://docs.spring.io/spring-boot/
- Spring Data JPA: https://docs.spring.io/spring-data/jpa/
- JWT: https://jwt.io/
- Lombok: https://projectlombok.org/
- MySQL: https://dev.mysql.com/doc/

---

**Status**: ✅ Foundation Complete - Ready for Service Layer Implementation  
**Next**: Implement Service classes with business logic  
**ETA**: Service Layer (4-6 hours), Controllers (2-3 hours), Security (3-4 hours)

