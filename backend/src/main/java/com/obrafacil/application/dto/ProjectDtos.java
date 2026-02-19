package com.obrafacil.application.dto;

import com.obrafacil.domain.enums.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ProjectDtos {
  public record ProjectRequest(@NotBlank String nome, String endereco, @NotNull UUID clientId, @NotNull BigDecimal orcamentoTotal) {}
  public record StageRequest(@NotBlank String nome, @NotNull Integer ordem) {}
  public record ChecklistToggleRequest(@NotNull Boolean concluido) {}
  public record DiaryRequest(@NotNull LocalDate data, @NotBlank String descricao, String clima, String ocorrencias, String idempotencyKey, String clientGeneratedId) {}
  public record PhotoRequest(@NotBlank String url, String categoria) {}
  public record RncRequest(@NotBlank String titulo, @NotBlank String descricao, @NotNull Severity gravidade, @NotNull LocalDate data) {}
  public record PaymentRequest(@NotBlank String descricao, String categoria, @NotNull BigDecimal valor, @NotNull LocalDate dataVencimento, @NotNull PaymentStatus status) {}
  public record DocumentRequest(@NotBlank String nome, @NotNull DocType tipo, @NotBlank String url, @NotNull LocalDate data) {}
  public record MessageRequest(@NotBlank String text, Boolean isDecision, String idempotencyKey, String clientGeneratedId) {}
}
