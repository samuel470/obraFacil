package com.obrafacil.infrastructure.security;

import com.obrafacil.infrastructure.persistence.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
  private final JwtService jwtService; private final UsuarioRepository usuarioRepository;
  public AuthInterceptor(JwtService jwtService, UsuarioRepository usuarioRepository) { this.jwtService = jwtService; this.usuarioRepository = usuarioRepository; }
  @Override public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
    String h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")) {
      try {
        var id = jwtService.userId(h.substring(7));
        usuarioRepository.findById(id).ifPresent(u -> req.setAttribute("authUser", new AuthUser(u.id, u.role, u.plan)));
      } catch (Exception ignored) {}
    }
    return true;
  }
}
