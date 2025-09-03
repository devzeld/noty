package me.zeld.not;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class NotApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotApplication.class, args);
    }

}
