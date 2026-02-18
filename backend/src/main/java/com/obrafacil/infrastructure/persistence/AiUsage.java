package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="ai_usage")
public class AiUsage {
  @Id public UUID id; UUID userId; String monthRef; Integer usedCount;
}
