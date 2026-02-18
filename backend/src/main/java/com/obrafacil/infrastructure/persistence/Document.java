package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="documents")
public class Document {
  @Id public UUID id; UUID projectId; String nome; @Enumerated(EnumType.STRING) DocType tipo; String url; LocalDate data;
}
