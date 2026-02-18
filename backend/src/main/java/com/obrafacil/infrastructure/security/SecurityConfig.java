package com.obrafacil.infrastructure.security;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(c->c.disable()).authorizeHttpRequests(a->a.anyRequest().permitAll());
    return http.build();
  }
  @Bean BCryptPasswordEncoder encoder(){ return new BCryptPasswordEncoder(); }
}
