package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.TripChatMessageJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripChatMessageJpaRepository extends JpaRepository<TripChatMessageJpaEntity, Long> {

    List<TripChatMessageJpaEntity> findAllByTripIdAndDeletedAtIsNullOrderByCreatedAtAscIdAsc(
            Long tripId,
            Pageable pageable
    );
}