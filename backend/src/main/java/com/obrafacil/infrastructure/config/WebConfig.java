package com.obrafacil.infrastructure.config;

import com.obrafacil.infrastructure.security.AuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  private final AuthInterceptor authInterceptor;
  public WebConfig(AuthInterceptor authInterceptor) { this.authInterceptor = authInterceptor; }
  @Override public void addInterceptors(InterceptorRegistry registry) { registry.addInterceptor(authInterceptor); }
  @Override public void addCorsMappings(CorsRegistry registry) { registry.addMapping("/**").allowedOrigins("http://localhost:5173").allowedMethods("*"); }
}
