# 🚀 Service-Spot - Complete Development Roadmap

**Date:** November 28, 2025  
**Status:** Foundation Complete ✅  
**Next Phase:** Backend Implementation

---

## ✅ COMPLETED (Phase 0: Foundation)

### Backend:
- ✅ Project setup with Spring Boot 4.0 & Java 21
- ✅ Maven dependencies (JPA, Security, JWT, Validation, Lombok)
- ✅ Database configuration (MySQL)
- ✅ 4 Core Entities (User, ServiceListing, ServiceCategory, Booking)
- ✅ 2 Enums (Role, BookingStatus)
- ✅ 4 Repositories with 70+ query methods
- ✅ Complete entity relationships & validation
- ✅ Comprehensive documentation (2 guides)

### Frontend:
- ✅ React 18 + Vite + Tailwind CSS
- ✅ Complete UI components (20+ components)
- ✅ All pages (10 pages: Landing, Login, Signup, Services, Booking, Dashboard, etc.)
- ✅ AuthContext for state management
- ✅ API client configured with Axios
- ✅ Protected routes
- ✅ Error boundaries & loading states

### Issues Fixed:
- ✅ Role.java enum file corrupted - FIXED
- ✅ ServiceCategoryRepository corrupted - FIXED

---

## 🎯 PHASE 1: DTOs & Service Layer (Priority: HIGH)

**Estimated Time:** 4-6 hours  
**Goal:** Implement business logic and data transfer objects

### Step 1.1: Create DTO Package Structure
Create: `src/main/java/Team/C/Service/Spot/dto/`

#### Request DTOs:
```java
dto/
├── request/
│   ├── CustomerRegistrationRequest.java
│   ├── ProviderRegistrationRequest.java
│   ├── LoginRequest.java
│   ├── CreateServiceListingRequest.java
│   ├── UpdateServiceListingRequest.java
│   ├── CreateBookingRequest.java
│   └── UpdateBookingStatusRequest.java
│
└── response/
    ├── UserResponse.java
    ├── AuthResponse.java (contains token + user info)
    ├── ServiceListingResponse.java
    ├── BookingResponse.java
    ├── ServiceCategoryResponse.java
    └── ApiResponse.java (generic wrapper)
```

**Key DTOs to Create:**

1. **AuthResponse.java**
```java
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private UserResponse user;
}
```

2. **LoginRequest.java**
```java
public class LoginRequest {
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    private String password;
    
    private String role; // "customer" or "provider"
}
```

3. **UserResponse.java**
```java
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String role;
    // NO PASSWORD!
    private String city;
    private String state;
    // Provider-specific fields
    private String serviceType;
    private Boolean verified;
    private Double averageRating;
}
```

### Step 1.2: Create Service Classes

Create: `src/main/java/Team/C/Service/Spot/service/`

1. **AuthService.java** (Authentication & JWT)
```java
@Service
public class AuthService {
    // registerCustomer(CustomerRegistrationRequest)
    // registerProvider(ProviderRegistrationRequest)
    // login(LoginRequest)
    // generateToken(User)
    // validateToken(String token)
    // refreshToken(String refreshToken)
}
```

2. **UserService.java**
```java
@Service
public class UserService {
    // getUserById(Long id)
    // updateUser(Long id, UpdateUserRequest)
    // deleteUser(Long id)
    // searchProviders(SearchCriteria)
    // getProvidersByCity(String city)
    // verifyProvider(Long providerId)
}
```

3. **ServiceListingService.java**
```java
@Service
public class ServiceListingService {
    // createListing(CreateServiceListingRequest, Long providerId)
    // updateListing(Long id, UpdateServiceListingRequest)
    // deleteListing(Long id)
    // getListingById(Long id)
    // searchListings(SearchFilters)
    // getListingsByProvider(Long providerId)
    // incrementViewCount(Long id)
}
```

4. **BookingService.java**
```java
@Service
public class BookingService {
    // createBooking(CreateBookingRequest, Long customerId)
    // getBookingById(Long id)
    // confirmBooking(Long id, Long providerId)
    // cancelBooking(Long id, String reason, User user)
    // completeBooking(Long id)
    // getCustomerBookings(Long customerId)
    // getProviderBookings(Long providerId)
    // calculateRevenue(Long providerId)
}
```

5. **ServiceCategoryService.java**
```java
@Service
public class ServiceCategoryService {
    // getAllCategories()
    // getActiveCategories()
    // getCategoryById(Long id)
    // createCategory(CreateCategoryRequest) // Admin only
    // updateCategory(Long id, UpdateCategoryRequest)
}
```

---

## 🔐 PHASE 2: Security & JWT (Priority: HIGH)

**Estimated Time:** 3-4 hours  
**Goal:** Implement JWT-based authentication

### Step 2.1: Create Security Package
Create: `src/main/java/Team/C/Service/Spot/security/`

```java
security/
├── JwtTokenProvider.java       // Generate & validate JWT tokens
├── JwtAuthenticationFilter.java // Filter to check JWT on each request
├── SecurityConfig.java          // Spring Security configuration
├── UserDetailsServiceImpl.java // Load user for authentication
└── JwtAuthenticationEntryPoint.java // Handle auth errors
```

**Key Files:**

1. **JwtTokenProvider.java**
```java
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    // generateToken(User user)
    // getUserIdFromToken(String token)
    // validateToken(String token)
    // getExpirationDate(String token)
}
```

2. **SecurityConfig.java**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable()
            .cors()
            .and()
            .sessionManagement().sessionCreationPolicy(STATELESS)
            .and()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**", "/api/services", "/api/categories").permitAll()
                .requestMatchers("/api/bookings/**").authenticated()
                .requestMatchers("/api/services/create", "/api/services/*/edit").hasRole("PROVIDER")
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
```

### Step 2.2: Password Encryption
- Use BCrypt to hash passwords before saving
- Update AuthService to encrypt on registration
- Update login to compare encrypted passwords

---

## 🎮 PHASE 3: Controllers (Priority: HIGH)

**Estimated Time:** 2-3 hours  
**Goal:** Create REST API endpoints

Create: `src/main/java/Team/C/Service/Spot/controller/`

### Controllers to Create:

1. **AuthController.java** ✅ Priority 1
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/signup/customer")
    public ResponseEntity<AuthResponse> registerCustomer(@Valid @RequestBody CustomerRegistrationRequest request)
    
    @PostMapping("/signup/provider")
    public ResponseEntity<AuthResponse> registerProvider(@Valid @RequestBody ProviderRegistrationRequest request)
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request)
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request)
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request)
}
```

2. **ServiceController.java** ✅ Priority 1
```java
@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @GetMapping
    public ResponseEntity<List<ServiceListingResponse>> searchServices(@RequestParam Map<String, String> params)
    
    @GetMapping("/{id}")
    public ResponseEntity<ServiceListingResponse> getServiceById(@PathVariable Long id)
    
    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ServiceListingResponse> createService(@Valid @RequestBody CreateServiceListingRequest request)
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ServiceListingResponse> updateService(@PathVariable Long id, @RequestBody UpdateServiceListingRequest request)
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteService(@PathVariable Long id)
    
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ServiceListingResponse>> getProviderServices(@PathVariable Long providerId)
}
```

3. **BookingController.java** ✅ Priority 1
```java
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request)
    
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id)
    
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal User user)
    
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponse> confirmBooking(@PathVariable Long id)
    
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id, @RequestBody CancelRequest request)
    
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponse> completeBooking(@PathVariable Long id)
}
```

4. **UserController.java**
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal User user)
    
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody UpdateUserRequest request)
    
    @GetMapping("/providers")
    public ResponseEntity<List<UserResponse>> searchProviders(@RequestParam Map<String, String> params)
}
```

5. **CategoryController.java**
```java
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @GetMapping
    public ResponseEntity<List<ServiceCategoryResponse>> getAllCategories()
    
    @GetMapping("/{id}")
    public ResponseEntity<ServiceCategoryResponse> getCategoryById(@PathVariable Long id)
}
```

---

## ⚠️ PHASE 4: Exception Handling (Priority: MEDIUM)

**Estimated Time:** 1-2 hours

Create: `src/main/java/Team/C/Service/Spot/exception/`

```java
exception/
├── GlobalExceptionHandler.java
├── ResourceNotFoundException.java
├── UnauthorizedException.java
├── ValidationException.java
├── DuplicateResourceException.java
└── ErrorResponse.java
```

**GlobalExceptionHandler.java**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(new ErrorResponse("Validation failed", errors));
    }
}
```

---

## 🧪 PHASE 5: Testing (Priority: MEDIUM)

**Estimated Time:** 2-3 hours

### Create Test Classes:
```java
src/test/java/.../
├── service/
│   ├── AuthServiceTest.java
│   ├── UserServiceTest.java
│   ├── BookingServiceTest.java
│   └── ServiceListingServiceTest.java
│
├── controller/
│   ├── AuthControllerTest.java
│   ├── ServiceControllerTest.java
│   └── BookingControllerTest.java
│
└── repository/
    ├── UserRepositoryTest.java
    └── BookingRepositoryTest.java
```

---

## 📊 PHASE 6: Database Seeding (Priority: LOW)

**Estimated Time:** 1 hour

Create: `src/main/java/Team/C/Service/Spot/config/DataSeeder.java`

```java
@Component
public class DataSeeder implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // Seed service categories
        // Seed sample providers
        // Seed sample services
    }
}
```

**Sample Categories to Seed:**
1. Home Repair (Plumbing, Electrical, Carpentry)
2. Cleaning Services
3. Beauty & Wellness
4. Event Services (Photography, Catering)
5. Education & Tutoring
6. IT & Tech Support
7. Health Services
8. Transportation

---

## 🔄 PHASE 7: Advanced Features (Priority: LOW)

### 7.1 File Upload (Service Images)
- Add MultipartFile handling
- Store images in `/uploads` or cloud (AWS S3)
- Update ServiceListing with image URLs

### 7.2 Email Notifications
- Add Spring Mail dependency
- Send booking confirmations
- Send status update emails

### 7.3 Reviews & Ratings
- Create Review entity
- Link to Booking (1:1)
- Update average ratings

### 7.4 Search Optimization
- Add full-text search
- Implement filters (price range, rating, location)
- Add pagination

### 7.5 Analytics Dashboard
- Provider stats (revenue, bookings, ratings)
- Customer history
- Popular services

---

## 🔧 CURRENT FRONTEND-BACKEND INTEGRATION GAPS

### Frontend Expects (from api.js analysis):

#### Customer APIs:
```javascript
POST /api/customer/signup
POST /api/customer/login
PUT /api/customer/update/{id}
DELETE /api/customer/delete/{id}
GET /api/customer/{id}
```

#### Provider APIs:
```javascript
POST /api/provider/signup
POST /api/provider/login (with email in body)
PUT /api/provider/update
DELETE /api/provider/delete/{id}
GET /api/provider/all
GET /api/provider/{id}
GET /api/provider/search?city={city}
```

#### Service APIs:
```javascript
GET /api/services
GET /api/services/{id}
GET /api/services/provider/{providerId}
POST /api/services
PUT /api/services/{id}
DELETE /api/services/{id}
```

#### Booking APIs:
```javascript
POST /api/bookings
GET /api/bookings?userId={id}&role={role}
GET /api/bookings/{id}
PATCH /api/bookings/{id} (status update)
DELETE /api/bookings/{id}
```

### ⚠️ REQUIRED CHANGES:

1. **Unify Auth Endpoints**
   - Frontend uses `/customer/*` and `/provider/*`
   - Backend should use `/api/auth/*` with role in request
   - Update frontend api.js to use unified endpoints

2. **Token Handling**
   - Frontend expects JWT token in response
   - Backend must return: `{ token, user, expiresIn }`

3. **Response Format**
   - Standardize: `{ success, data, message, errors }`

---

## 📝 IMMEDIATE NEXT STEPS (Start Here)

### 🎯 Week 1: Core Backend (20-30 hours)

**Day 1-2: DTOs & Mappers (6 hours)**
1. ✅ Create all DTO classes
2. ✅ Create DTO mappers (Entity ↔ DTO)
3. ✅ Test DTO validation

**Day 3-4: Service Layer (8 hours)**
1. ✅ Implement AuthService with BCrypt
2. ✅ Implement UserService
3. ✅ Implement ServiceListingService
4. ✅ Implement BookingService
5. ✅ Write unit tests

**Day 5-6: Security & JWT (6 hours)**
1. ✅ Implement JwtTokenProvider
2. ✅ Configure Spring Security
3. ✅ Create JWT filter
4. ✅ Test authentication flow

**Day 7: Controllers (6 hours)**
1. ✅ Implement AuthController
2. ✅ Implement ServiceController
3. ✅ Implement BookingController
4. ✅ Test with Postman

### 🎯 Week 2: Integration & Testing (15-20 hours)

**Day 1-2: Exception Handling & Validation (4 hours)**
1. ✅ Global exception handler
2. ✅ Custom exceptions
3. ✅ Validation error responses

**Day 3-4: Frontend Integration (6 hours)**
1. ✅ Update frontend API client
2. ✅ Test login/signup flow
3. ✅ Test service listing
4. ✅ Test booking creation

**Day 5: Testing (4 hours)**
1. ✅ Integration tests
2. ✅ End-to-end testing
3. ✅ Fix bugs

**Day 6-7: Database Seeding & Deployment (6 hours)**
1. ✅ Seed categories
2. ✅ Create sample data
3. ✅ Deploy backend (optional)
4. ✅ Documentation

---

## 🚀 Quick Start Commands

### Backend:
```bash
# Compile
./mvnw clean compile

# Run
./mvnw spring-boot:run

# Run on specific port
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8080

# Build JAR
./mvnw clean package -DskipTests

# Run with profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend:
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database:
```sql
-- Create database
CREATE DATABASE servicespot;

-- Use database
USE servicespot;

-- View tables (after running backend)
SHOW TABLES;

-- Check data
SELECT * FROM users;
SELECT * FROM service_listings;
SELECT * FROM bookings;
```

---

## 📚 Resources & Documentation

### Spring Boot:
- [Spring Boot Docs](https://docs.spring.io/spring-boot/)
- [Spring Security JWT](https://spring.io/guides/gs/securing-web/)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/)

### React & Frontend:
- [React Docs](https://react.dev/)
- [Axios](https://axios-http.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Testing:
- [JUnit 5](https://junit.org/junit5/)
- [Mockito](https://site.mockito.org/)
- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)

---

## 📊 Progress Tracking

| Phase | Status | Priority | Time Est. | Completed |
|-------|--------|----------|-----------|-----------|
| Foundation | ✅ Done | HIGH | 8h | 100% |
| DTOs & Services | ⏳ Next | HIGH | 6h | 0% |
| Security & JWT | 📅 Planned | HIGH | 4h | 0% |
| Controllers | 📅 Planned | HIGH | 3h | 0% |
| Exception Handling | 📅 Planned | MEDIUM | 2h | 0% |
| Testing | 📅 Planned | MEDIUM | 3h | 0% |
| Database Seeding | 📅 Planned | LOW | 1h | 0% |
| Advanced Features | 📅 Future | LOW | TBD | 0% |

---

## 🎯 Success Criteria

### Backend Complete When:
- ✅ All DTOs created
- ✅ All services implemented
- ✅ JWT authentication working
- ✅ All controllers responding correctly
- ✅ Exception handling in place
- ✅ Basic tests passing
- ✅ Frontend can login, create services, and make bookings

### Project Complete When:
- ✅ Full authentication flow works
- ✅ Customers can browse and book services
- ✅ Providers can list services and manage bookings
- ✅ Search and filters functional
- ✅ All CRUD operations work
- ✅ Error handling graceful
- ✅ Basic security implemented

---

**STATUS:** Ready to begin Phase 1 (DTOs & Services)  
**RECOMMENDATION:** Start with AuthService and DTOs first, then Security, then Controllers  
**BLOCKERS:** None - All foundation complete

**Good luck! 🚀**

