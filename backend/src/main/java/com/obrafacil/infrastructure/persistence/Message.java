package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="messages")
public class Message {
  @Id public UUID id; UUID projectId; UUID senderId; @Column(length=2000) String text; Instant timestamp; Boolean isDecision; String idempotencyKey;
}
