package me.zeld.noty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class NotyApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotyApplication.class, args);
    }

}
