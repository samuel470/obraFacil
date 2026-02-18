package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="checklist_items")
public class ChecklistItem {
  @Id public UUID id; UUID etapaId; String rotulo; Boolean concluido;
}
