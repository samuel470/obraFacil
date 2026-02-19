package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ProjectRepository extends JpaRepository<Project, UUID> { List<Project> findByClientId(UUID clientId); List<Project> findByResponsibleId(UUID responsibleId); long countByResponsibleIdAndStatusNot(UUID id, com.obrafacil.domain.enums.ProjectStatus status); }
