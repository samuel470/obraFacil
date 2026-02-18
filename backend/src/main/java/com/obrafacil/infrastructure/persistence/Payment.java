package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="payments")
public class Payment {
  @Id public UUID id; UUID projectId; String descricao; String categoria; BigDecimal valor; LocalDate dataVencimento; @Enumerated(EnumType.STRING) PaymentStatus status;
}
