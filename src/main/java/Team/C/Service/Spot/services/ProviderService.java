package Team.C.Service.Spot.services;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import Team.C.Service.Spot.model.Provider;
import Team.C.Service.Spot.repositery.ProviderRepo;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepo providerRepo;

    // Signup / create provider
    public Provider signup(Provider provider) {
        // Optional: Hash password before saving
        return providerRepo.save(provider);
    }

    // Login by email
    public Provider login(String email) {
        Optional<Provider> provider = providerRepo.findByEmail(email);
        return provider.orElse(null);
    }

    // Delete provider by ID
    public void delete(Long id) {
        providerRepo.deleteById(id);
    }

    // Update provider
    public Provider update(Provider provider) {
        return providerRepo.save(provider);
    }

    public List<Provider> getAllProviders() {
        return providerRepo.findAll();
        
    }
}
