package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="diary_photos")
public class DiaryPhoto {
  @Id
  public UUID id;
  public UUID diarioId;
  public String url;
  public String categoria;
  public Instant createdAt;
}
