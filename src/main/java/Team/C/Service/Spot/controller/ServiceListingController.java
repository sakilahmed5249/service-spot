package Team.C.Service.Spot.controller;

import Team.C.Service.Spot.dto.request.CreateServiceListingRequest;
import Team.C.Service.Spot.dto.response.ApiResponse;
import Team.C.Service.Spot.dto.response.ServiceListingResponse;
import Team.C.Service.Spot.service.ServiceListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Service Listing operations.
 * Handles CRUD operations and search functionality for service listings.
 *
 * @author Team C
 * @version 3.0
 * @since 2025-11-29
 */
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ServiceListingController {

    private final ServiceListingService serviceListingService;

    /**
     * Get all service listings.
     * Returns all active listings for customers to browse.
     *
     * @return list of all active service listings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getAllListings() {
        List<ServiceListingResponse> listings = serviceListingService.getAllActiveListings();
        return ResponseEntity.ok(ApiResponse.success("Service listings retrieved successfully", listings));
    }

    /**
     * Get service listing by ID.
     *
     * @param id listing ID
     * @return service listing details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceListingResponse>> getListingById(@PathVariable Long id) {
        ServiceListingResponse listing = serviceListingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success("Service listing retrieved successfully", listing));
    }

    /**
     * Create a new service listing.
     * Temporary: providerId from request body (should come from JWT token in production)
     *
     * @param request service listing details
     * @return created service listing
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ServiceListingResponse>> createListing(
            @Valid @RequestBody CreateServiceListingRequest request,
            @RequestParam(required = false) Long providerId) {

        // TODO: Get providerId from JWT token in production
        if (providerId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Provider ID is required", HttpStatus.BAD_REQUEST.value()));
        }

        ServiceListingResponse listing = serviceListingService.createListing(request, providerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service listing created successfully", listing));
    }

    /**
     * Update service listing.
     *
     * @param id listing ID
     * @param request update details
     * @param providerId provider ID (from request param temporarily)
     * @return updated service listing
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceListingResponse>> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody CreateServiceListingRequest request,
            @RequestParam(required = false) Long providerId) {

        if (providerId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Provider ID is required", HttpStatus.BAD_REQUEST.value()));
        }

        ServiceListingResponse listing = serviceListingService.updateListing(id, request, providerId);
        return ResponseEntity.ok(ApiResponse.success("Service listing updated successfully", listing));
    }

    /**
     * Delete service listing.
     *
     * @param id listing ID
     * @param providerId provider ID (from request param temporarily)
     * @return success response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteListing(
            @PathVariable Long id,
            @RequestParam(required = false) Long providerId) {

        if (providerId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Provider ID is required", HttpStatus.BAD_REQUEST.value()));
        }

        serviceListingService.deleteListing(id, providerId);
        return ResponseEntity.ok(ApiResponse.success("Service listing deleted successfully", "Deleted"));
    }

    /**
     * Get listings by provider.
     *
     * @param providerId provider ID
     * @return list of provider's listings
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getListingsByProvider(
            @PathVariable Long providerId) {
        List<ServiceListingResponse> listings = serviceListingService.getListingsByProvider(providerId);
        return ResponseEntity.ok(ApiResponse.success("Provider listings retrieved successfully", listings));
    }

    /**
     * Get listings by category.
     *
     * @param categoryId category ID
     * @return list of listings in category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getListingsByCategory(
            @PathVariable Long categoryId) {
        List<ServiceListingResponse> listings = serviceListingService.getListingsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category listings retrieved successfully", listings));
    }

    /**
     * Get listings by city.
     *
     * @param city city name
     * @return list of listings in city
     */
    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getListingsByCity(
            @PathVariable String city) {
        List<ServiceListingResponse> listings = serviceListingService.getListingsByCity(city);
        return ResponseEntity.ok(ApiResponse.success("City listings retrieved successfully", listings));
    }

    /**
     * Search listings by keyword.
     *
     * @param keyword search keyword
     * @return list of matching listings
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> searchListings(
            @RequestParam String keyword) {
        List<ServiceListingResponse> listings = serviceListingService.searchListings(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", listings));
    }

    /**
     * Get featured listings.
     *
     * @return list of featured listings
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getFeaturedListings() {
        List<ServiceListingResponse> listings = serviceListingService.getFeaturedListings();
        return ResponseEntity.ok(ApiResponse.success("Featured listings retrieved successfully", listings));
    }

    /**
     * Get top-rated listings by city.
     *
     * @param city city name
     * @param minRating minimum rating (default 4.0)
     * @return list of top-rated listings
     */
    @GetMapping("/top-rated")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getTopRatedListings(
            @RequestParam String city,
            @RequestParam(defaultValue = "4.0") Double minRating) {
        List<ServiceListingResponse> listings = serviceListingService.getTopRatedListings(city, minRating);
        return ResponseEntity.ok(ApiResponse.success("Top-rated listings retrieved successfully", listings));
    }

    /**
     * Get popular listings by city.
     *
     * @param city city name
     * @return list of popular listings
     */
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getPopularListings(
            @RequestParam String city) {
        List<ServiceListingResponse> listings = serviceListingService.getPopularListings(city);
        return ResponseEntity.ok(ApiResponse.success("Popular listings retrieved successfully", listings));
    }

    /**
     * Toggle listing active status.
     *
     * @param id listing ID
     * @param providerId provider ID
     * @return updated listing
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<ServiceListingResponse>> toggleListingStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Long providerId) {

        if (providerId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Provider ID is required", HttpStatus.BAD_REQUEST.value()));
        }

        ServiceListingResponse listing = serviceListingService.toggleListingStatus(id, providerId);
        return ResponseEntity.ok(ApiResponse.success("Listing status updated successfully", listing));
    }

    /**
     * Get list of unique cities where services are available.
     *
     * @return list of cities
     */
    @GetMapping("/locations/cities")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCities() {
        List<ServiceListingResponse> allListings = serviceListingService.getFeaturedListings();
        List<String> cities = allListings.stream()
                .map(ServiceListingResponse::getCity)
                .filter(city -> city != null && !city.isEmpty())
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Available cities retrieved successfully", cities));
    }

    /**
     * Get list of unique service types available.
     *
     * @return list of service types
     */
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableServiceTypes() {
        List<ServiceListingResponse> allListings = serviceListingService.getFeaturedListings();
        List<String> serviceTypes = allListings.stream()
                .map(listing -> listing.getCategory() != null ? listing.getCategory().getName() : null)
                .filter(type -> type != null && !type.isEmpty())
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Available service types retrieved successfully", serviceTypes));
    }

    /**
     * Get list of unique pincodes where services are available.
     *
     * @return list of pincodes
     */
    @GetMapping("/locations/pincodes")
    public ResponseEntity<ApiResponse<List<Integer>>> getAvailablePincodes() {
        List<ServiceListingResponse> allListings = serviceListingService.getFeaturedListings();
        List<Integer> pincodes = allListings.stream()
                .map(ServiceListingResponse::getPincode)
                .filter(pincode -> pincode != null)
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Available pincodes retrieved successfully", pincodes));
    }

    /**
     * Get service listings by pincode.
     *
     * @param pincode pincode to search
     * @return list of services in that pincode
     */
    @GetMapping("/pincode/{pincode}")
    public ResponseEntity<ApiResponse<List<ServiceListingResponse>>> getListingsByPincode(
            @PathVariable Integer pincode) {
        List<ServiceListingResponse> allListings = serviceListingService.getFeaturedListings();
        List<ServiceListingResponse> filteredListings = allListings.stream()
                .filter(listing -> pincode.equals(listing.getPincode()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Services in pincode " + pincode + " retrieved successfully", filteredListings));
    }
}

