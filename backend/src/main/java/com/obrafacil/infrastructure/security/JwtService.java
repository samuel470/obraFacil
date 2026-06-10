package com.obrafacil.infrastructure.security;

import com.obrafacil.domain.enums.Role;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
  private final SecretKey key;
  public JwtService(@Value("${app.jwt.secret}") String secret){ this.key = Keys.hmacShaKeyFor(secret.getBytes()); }
  public String generateAccess(UUID id, Role role){
    return Jwts.builder().subject(id.toString()).claim("role", role.name()).issuedAt(new Date()).expiration(Date.from(Instant.now().plusSeconds(3600))).signWith(key).compact();
  }
  public String generateRefresh(UUID id){
    return Jwts.builder().subject(id.toString()).issuedAt(new Date()).expiration(Date.from(Instant.now().plusSeconds(60L*60*24*30))).signWith(key).compact();
  }
  public UUID userId(String token){ return UUID.fromString(Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject()); }
}
