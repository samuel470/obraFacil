package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="refresh_tokens")
public class RefreshToken {
  @Id public UUID id; UUID userId; String token; Instant expiresAt; Boolean revoked;
}
