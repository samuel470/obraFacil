package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="nonconformities")
public class NonConformity {
  @Id
  public UUID id;
  public UUID projectId;
  public String titulo;
  @Column(length=3000)
  public String descricao;
  @Enumerated(EnumType.STRING)
  public RncStatus status;
  @Enumerated(EnumType.STRING)
  public Severity gravidade;
  public LocalDate data;
}
