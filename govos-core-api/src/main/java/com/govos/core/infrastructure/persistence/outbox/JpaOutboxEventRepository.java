package com.govos.core.infrastructure.persistence.outbox;

import com.govos.core.domain.outbox.OutboxStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface JpaOutboxEventRepository extends JpaRepository<JpaOutboxEvent, UUID> {

    @Query(value = "SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT :limit FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<JpaOutboxEvent> findPendingEventsForUpdate(@Param("limit") int limit);

    List<JpaOutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxStatus status, Pageable pageable);

    @Modifying
    @Query("DELETE FROM JpaOutboxEvent o WHERE o.status = :status AND o.publishedAt < :cutoff")
    int deleteOldPublishedEvents(@Param("status") OutboxStatus status, @Param("cutoff") Instant cutoff);
}
