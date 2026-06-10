package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface NonConformityRepository extends JpaRepository<NonConformity, UUID> { List<NonConformity> findByProjectId(UUID id); long countByProjectIdAndStatus(UUID id, com.obrafacil.domain.enums.RncStatus s); }
