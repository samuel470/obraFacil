package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="diaries")
public class Diary {
  @Id public UUID id; UUID projectId; LocalDate data; @Column(length=3000) String descricao; String clima; String ocorrencias; Instant createdAt; String idempotencyKey;
}
