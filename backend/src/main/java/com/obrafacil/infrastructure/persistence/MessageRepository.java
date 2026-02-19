package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MessageRepository extends JpaRepository<Message, UUID> { List<Message> findByProjectIdOrderByTimestampAsc(UUID id); Optional<Message> findByIdempotencyKey(String k); }
