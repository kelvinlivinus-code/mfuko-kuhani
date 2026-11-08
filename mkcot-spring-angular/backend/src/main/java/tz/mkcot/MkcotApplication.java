package tz.mkcot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** MKCOT (Mfuko wa Kuhani wa Operation and Training): API ya mfuko wa wanachama. */
@SpringBootApplication(exclude = org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class)
@org.springframework.scheduling.annotation.EnableScheduling
public class MkcotApplication {
    public static void main(String[] args) {
        SpringApplication.run(MkcotApplication.class, args);
    }
}
