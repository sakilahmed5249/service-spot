package Team.C.Service.Spot.services;

import org.springframework.stereotype.Service;
import Team.C.Service.Spot.model.Customer;
import Team.C.Service.Spot.repositery.CustomerRepo;
import lombok.RequiredArgsConstructor;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepo customerRepo;

    // Signup new customer
    public Customer signup(Customer customer) {
        return customerRepo.save(customer);
    }

    // Login
    public Boolean login(String email, String password) {
        return customerRepo.findByEmail(email)
                .map(c -> c.getPassword().equals(password))
                .orElse(false);
    }

    // Update password
    public Customer updatePassword(Long id, String newPassword) {
        return customerRepo.findById(id)
                .map(c -> {
                    c.setPassword(newPassword);
                    return customerRepo.save(c);
                })
                .orElse(null);
    }

    // Delete customer
    public void deleteCustomer(Long id) {
        customerRepo.deleteById(id);
    }


    public Customer updateCustomer(Long id, Customer updatedCustomer) {
        return customerRepo.findById(id)
                .map(existing -> {
                    existing.setName(updatedCustomer.getName());
                    existing.setEmail(updatedCustomer.getEmail());
                    existing.setPassword(updatedCustomer.getPassword());
                    existing.setPhone(updatedCustomer.getPhone());
                    existing.setDoorNo(updatedCustomer.getDoorNo());
                    existing.setAddressLine(updatedCustomer.getAddressLine());
                    existing.setCity(updatedCustomer.getCity());
                    existing.setState(updatedCustomer.getState());
                    existing.setPincode(updatedCustomer.getPincode());
                    return customerRepo.save(existing);
                })
                .orElse(null);
    }
}
