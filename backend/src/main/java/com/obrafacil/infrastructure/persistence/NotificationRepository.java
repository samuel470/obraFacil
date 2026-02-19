package com.obrafacil.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface NotificationRepository extends JpaRepository<Notification, UUID> { List<Notification> findByUserIdOrderByDataDesc(UUID userId); }
