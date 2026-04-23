package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.TripJoinRequestJpaEntity;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripJoinRequestJpaRepository extends JpaRepository<TripJoinRequestJpaEntity, Long> {

    Optional<TripJoinRequestJpaEntity> findByTripIdAndRequesterUserId(Long tripId, Long requesterUserId);

    boolean existsByTripIdAndRequesterUserIdAndStatus(
            Long tripId,
            Long requesterUserId,
            TripJoinRequestStatus status
    );

    List<TripJoinRequestJpaEntity> findAllByTripIdAndStatus(Long tripId, TripJoinRequestStatus status);
}