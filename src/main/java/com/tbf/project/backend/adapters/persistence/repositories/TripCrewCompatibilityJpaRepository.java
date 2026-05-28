package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.TripCrewCompatibilityJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TripCrewCompatibilityJpaRepository extends JpaRepository<TripCrewCompatibilityJpaEntity, Long> {
    Optional<TripCrewCompatibilityJpaEntity> findByTripIdAndCandidateUserId(Long tripId, Long candidateUserId);
    void deleteAllByTripId(Long tripId);
}