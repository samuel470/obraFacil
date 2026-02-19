package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> { Optional<Usuario> findByEmail(String email); }
