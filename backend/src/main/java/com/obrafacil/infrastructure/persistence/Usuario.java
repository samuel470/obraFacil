package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="usuarios")
public class Usuario {
  @Id public UUID id; String nome; @Column(unique=true) String email; String senhaHash; @Enumerated(EnumType.STRING) Role role; @Enumerated(EnumType.STRING) Plan plan; String avatarUrl; Instant createdAt;
}
