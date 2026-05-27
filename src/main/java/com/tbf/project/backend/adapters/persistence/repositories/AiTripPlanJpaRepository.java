package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.AiTripPlanJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiTripPlanJpaRepository extends JpaRepository<AiTripPlanJpaEntity, Long> {
    Optional<AiTripPlanJpaEntity> findByTripId(Long tripId);
}