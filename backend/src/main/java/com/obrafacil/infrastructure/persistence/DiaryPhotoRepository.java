package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface DiaryPhotoRepository extends JpaRepository<DiaryPhoto, UUID> { List<DiaryPhoto> findByDiarioId(UUID diaryId); }
