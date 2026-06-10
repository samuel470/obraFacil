package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface StageRepository extends JpaRepository<Stage, UUID> { List<Stage> findByProjectIdOrderByOrdem(UUID projectId); }
