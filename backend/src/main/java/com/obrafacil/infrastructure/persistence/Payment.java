package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="payments")
public class Payment {
  @Id
  public UUID id;
  public UUID projectId;
  public String descricao;
  public String categoria;
  public BigDecimal valor;
  public LocalDate dataVencimento;
  @Enumerated(EnumType.STRING)
  public PaymentStatus status;
}
