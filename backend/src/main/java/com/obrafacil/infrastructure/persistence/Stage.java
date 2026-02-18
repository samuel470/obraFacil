package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="stages")
public class Stage {
  @Id public UUID id; UUID projectId; String nome; Integer progresso; Boolean concluido; Integer ordem;
}
