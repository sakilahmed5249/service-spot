package Team.C.Service.Spot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Enable scheduled tasks for auto-cleanup
public class ServiceSpotApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceSpotApplication.class, args);
	}
	

}
