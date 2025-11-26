package Team.C.Service.Spot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="customer")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
     
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false)
    private String name;

    @Column(unique=true, nullable=false)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(unique=true,nullable=false)
    private String phone;
    @Column(unique=true,nullable=false)
    private String doorNo;
    @Column(nullable=false)
    private String addressLine;
    @Column(nullable=false)
    private String city;
    @Column(nullable=false)
    private String state;
    @Column(nullable=false)
    private Integer pincode;

    

    
}
