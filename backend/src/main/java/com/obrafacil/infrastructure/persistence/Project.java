package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="projects")
public class Project {
  @Id
  public UUID id;
  public String nome;
  public String endereco;
  @Enumerated(EnumType.STRING)
  public ProjectStatus status;
  public UUID clientId;
  public UUID responsibleId;
  public Integer progresso;
  public BigDecimal orcamentoTotal;
  public Instant criadoEm;
}
