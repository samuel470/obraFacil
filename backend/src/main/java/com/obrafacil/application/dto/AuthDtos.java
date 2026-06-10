package com.obrafacil.application.dto;

import com.obrafacil.domain.enums.*;
import jakarta.validation.constraints.*;

public class AuthDtos {
  public record RegisterRequest(@NotBlank String nome, @Email String email, @NotBlank String senha, @NotNull Role role, @NotNull Plan plan) {}
  public record LoginRequest(@Email String email, @NotBlank String senha) {}
  public record TokenResponse(String accessToken, String refreshToken) {}
  public record RefreshRequest(@NotBlank String refreshToken) {}
}
