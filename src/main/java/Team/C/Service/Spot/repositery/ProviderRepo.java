package Team.C.Service.Spot.repositery;

import Team.C.Service.Spot.model.Provider;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderRepo  extends JpaRepository<Provider,Long>{
    Optional<Provider> findByEmail(String email);
}

    

