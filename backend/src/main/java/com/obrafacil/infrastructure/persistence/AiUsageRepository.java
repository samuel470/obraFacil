package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AiUsageRepository extends JpaRepository<AiUsage, UUID> { Optional<AiUsage> findByUserIdAndMonthRef(UUID userId, String monthRef); }
