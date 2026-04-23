package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.TripMemberJpaEntity;
import com.tbf.project.backend.entities.model.enums.TripMemberRole;
import com.tbf.project.backend.entities.model.enums.TripMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripMemberJpaRepository extends JpaRepository<TripMemberJpaEntity, Long> {

    boolean existsByTripIdAndUserIdAndStatus(Long tripId, Long userId, TripMemberStatus status);

    long countByTripIdAndStatus(Long tripId, TripMemberStatus status);

    List<TripMemberJpaEntity> findAllByTripIdAndStatus(Long tripId, TripMemberStatus status);

    List<TripMemberJpaEntity> findAllByUserIdAndStatus(Long userId, TripMemberStatus status);

    List<TripMemberJpaEntity> findAllByUserIdAndRoleAndStatus(Long userId, TripMemberRole role, TripMemberStatus status);
}