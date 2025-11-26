package Team.C.Service.Spot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Team.C.Service.Spot.model.Provider;
import Team.C.Service.Spot.services.ProviderService;

import java.util.List;

@RestController
@RequestMapping("/provider")  // Changed from /api/providers to /provider
public class ProviderController {

    @Autowired
    private ProviderService providerService;

    // Signup: create new provider
    @PostMapping("/signup")
    public ResponseEntity<Provider> signup(@RequestBody Provider provider) {
        Provider savedProvider = providerService.signup(provider);
        return ResponseEntity.ok(savedProvider);
    }

    // Login by email
    @PostMapping("/login")
    public ResponseEntity<Provider> login(@RequestParam String email) {
        Provider provider = providerService.login(email);
        if (provider == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(provider);
    }

    // Update provider
    @PutMapping("/update")
    public ResponseEntity<Provider> update(@RequestBody Provider provider) {
        Provider updatedProvider = providerService.update(provider);
        return ResponseEntity.ok(updatedProvider);
    }

    // Delete provider by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        providerService.delete(id);
        return ResponseEntity.ok("Provider deleted successfully");
    }

    // Get all providers
    @GetMapping("/all")
    public ResponseEntity<List<Provider>> getAllProviders() {
        List<Provider> providers = providerService.getAllProviders();
        return ResponseEntity.ok(providers);
    }
}
