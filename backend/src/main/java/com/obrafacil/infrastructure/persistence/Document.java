package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="documents")
public class Document {
  @Id
  public UUID id;
  public UUID projectId;
  public String nome;
  @Enumerated(EnumType.STRING)
  public DocType tipo;
  public String url;
  public LocalDate data;
}
