package com.space316.be;

import com.space316.be.slack.SlackProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@EnableConfigurationProperties(SlackProperties.class)
@SpringBootApplication
public class Space316BeApplication {

  public static void main(String[] args) {
    SpringApplication.run(Space316BeApplication.class, args);
  }
}
