package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="notifications")
public class Notification {
  @Id public UUID id; UUID userId; String tipo; String titulo; String corpo; Boolean lido; Instant data;
}
