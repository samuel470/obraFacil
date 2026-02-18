package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="nonconformities")
public class NonConformity {
  @Id public UUID id; UUID projectId; String titulo; @Column(length=3000) String descricao; @Enumerated(EnumType.STRING) RncStatus status; @Enumerated(EnumType.STRING) Severity gravidade; LocalDate data;
}
