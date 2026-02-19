package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="notifications")
public class Notification {
  @Id
  public UUID id;
  public UUID userId;
  public String tipo;
  public String titulo;
  public String corpo;
  public Boolean lido;
  public Instant data;
}
