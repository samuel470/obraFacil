package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="usuarios")
public class Usuario {
  @Id
  public UUID id;
  public String nome;
  @Column(unique=true)
  public String email;
  @com.fasterxml.jackson.annotation.JsonIgnore
  public String senhaHash;
  @Enumerated(EnumType.STRING)
  public Role role;
  @Enumerated(EnumType.STRING)
  public Plan plan;
  public String avatarUrl;
  public Instant createdAt;
}
