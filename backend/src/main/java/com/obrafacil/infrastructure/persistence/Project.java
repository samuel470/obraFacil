package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="projects")
public class Project {
  @Id public UUID id; String nome; String endereco; @Enumerated(EnumType.STRING) ProjectStatus status; UUID clientId; UUID responsibleId; Integer progresso; BigDecimal orcamentoTotal; Instant criadoEm;
}
