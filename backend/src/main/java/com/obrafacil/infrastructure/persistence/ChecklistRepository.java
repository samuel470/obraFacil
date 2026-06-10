package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ChecklistRepository extends JpaRepository<ChecklistItem, UUID> { List<ChecklistItem> findByEtapaId(UUID etapaId); }
