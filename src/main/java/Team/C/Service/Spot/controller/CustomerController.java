package Team.C.Service.Spot.controller;

import org.springframework.web.bind.annotation.*;
import Team.C.Service.Spot.model.Customer;
import Team.C.Service.Spot.services.CustomerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // Signup
    @PostMapping("/signup")
    public Customer signup(@RequestBody Customer customer) {
        return customerService.signup(customer);
    }

    // Login
    @PostMapping("/login")
    public Boolean login(@RequestBody Customer customer) {
        return customerService.login(customer.getEmail(), customer.getPassword());
    }

    // Update password
    @PostMapping("/update")
    public Customer update(@RequestBody Customer customer) {
        return customerService.updatePassword(customer.getId(), customer.getPassword());
    }

    // Delete customer
   @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        customerService.deleteCustomer(id);
    }


     @PutMapping("/update/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer);
    }
}
