package Team.C.Service.Spot.exception;

import Team.C.Service.Spot.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application.
 * Provides centralized error handling for all controllers.
 * Returns standardized error responses using ApiResponse wrapper.
 *
 * @author Team C
 * @version 4.0
 * @since 2025-11-29
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle IllegalArgumentException (business logic errors).
     * Typically thrown when:
     * - Entity not found
     * - Invalid input data
     * - Business rule violations
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        log.error("IllegalArgumentException: {} at {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(ex.getMessage(), HttpStatus.BAD_REQUEST.value()));
    }

    /**
     * Handle validation errors from @Valid annotations.
     * Returns field-specific error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {

        log.error("Validation error: {}", ex.getMessage());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Validation failed", errors, HttpStatus.BAD_REQUEST.value()));
    }

    /**
     * Handle NullPointerException.
     * Should not happen in production, indicates a bug.
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ApiResponse<Object>> handleNullPointerException(
            NullPointerException ex, WebRequest request) {

        log.error("NullPointerException at {}: {}",
                request.getDescription(false), ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        "An internal error occurred. Please contact support.",
                        HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }

    /**
     * Handle SecurityException (authentication/authorization errors).
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Object>> handleSecurityException(
            SecurityException ex, WebRequest request) {

        log.error("SecurityException: {} at {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                        "Access denied: " + ex.getMessage(),
                        HttpStatus.FORBIDDEN.value()));
    }

    /**
     * Handle IllegalStateException (unexpected state errors).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {

        log.error("IllegalStateException: {} at {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(
                        "Operation failed: " + ex.getMessage(),
                        HttpStatus.CONFLICT.value()));
    }

    /**
     * Handle all other uncaught exceptions.
     * Last resort error handler.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(
            Exception ex, WebRequest request) {

        log.error("Unexpected error at {}: {}",
                request.getDescription(false), ex.getMessage(), ex);

        // Don't expose internal error details in production
        String message = "An unexpected error occurred. Please try again later.";

        // In development, you might want to see the actual error
        if (log.isDebugEnabled()) {
            message = ex.getMessage();
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(message, HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }

    /**
     * Handle database-related exceptions.
     */
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(
            org.springframework.dao.DataIntegrityViolationException ex) {

        log.error("Data integrity violation: {}", ex.getMessage());

        String message = "Data integrity error. This might be a duplicate entry or constraint violation.";

        // Try to provide more specific error message
        if (ex.getMessage().contains("Duplicate entry")) {
            message = "Duplicate entry. This record already exists.";
        } else if (ex.getMessage().contains("foreign key")) {
            message = "Cannot delete or update. This record is referenced by other data.";
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(message, HttpStatus.CONFLICT.value()));
    }

    /**
     * Handle database connection errors.
     */
    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataAccessException(
            org.springframework.dao.DataAccessException ex) {

        log.error("Database access error: {}", ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error(
                        "Database service temporarily unavailable. Please try again later.",
                        HttpStatus.SERVICE_UNAVAILABLE.value()));
    }
}

