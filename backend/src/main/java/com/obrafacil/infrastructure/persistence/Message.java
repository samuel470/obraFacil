package com.obrafacil.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import com.obrafacil.domain.enums.*;

@Entity
@Table(name="messages")
public class Message {
  @Id
  public UUID id;
  public UUID projectId;
  public UUID senderId;
  @Column(length=2000)
  public String text;
  public Instant timestamp;
  public Boolean isDecision;
  public String idempotencyKey;
}
