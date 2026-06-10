package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface DocumentRepository extends JpaRepository<Document, UUID> { List<Document> findByProjectId(UUID id); }
