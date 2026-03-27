package com.space316.be.api;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok", "service", "316space-be");
  }
}
