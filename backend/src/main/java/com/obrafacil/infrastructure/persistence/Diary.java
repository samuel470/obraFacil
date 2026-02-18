package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="diaries")
public class Diary {
  @Id
  public UUID id;
  public UUID projectId;
  public LocalDate data;
  @Column(length=3000)
  public String descricao;
  public String clima;
  public String ocorrencias;
  public Instant createdAt;
  public String idempotencyKey;
}
