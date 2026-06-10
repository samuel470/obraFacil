package com.obrafacil.infrastructure.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.context.annotation.*;

import java.io.IOException;
import java.util.UUID;

@Configuration
public class AppConfig {
  @Bean public OpenAPI openAPI(){ return new OpenAPI().info(new Info().title("ObraFácil API").version("v1")); }
  @Bean public Filter correlationFilter(){
    return new Filter(){
      @Override public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        String cid=((HttpServletRequest)request).getHeader("X-Correlation-Id"); if(cid==null||cid.isBlank()) cid= UUID.randomUUID().toString();
        MDC.put("correlationId",cid); ((HttpServletResponse)response).setHeader("X-Correlation-Id",cid);
        try{ chain.doFilter(request,response);} finally {MDC.clear();}
      }
    };
  }
}
