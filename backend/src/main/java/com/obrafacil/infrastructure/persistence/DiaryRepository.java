package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface DiaryRepository extends JpaRepository<Diary, UUID> { List<Diary> findTop10ByProjectIdOrderByCreatedAtDesc(UUID pid); Optional<Diary> findByIdempotencyKey(String k); }
