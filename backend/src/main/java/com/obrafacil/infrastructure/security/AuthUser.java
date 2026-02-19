package com.obrafacil.infrastructure.security;

import com.obrafacil.domain.enums.*;
import java.util.UUID;
public record AuthUser(UUID id, Role role, Plan plan) {}
