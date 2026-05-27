package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.AiTripPlan;

import java.util.Optional;

public interface AiTripPlanGateway {
    AiTripPlan save(AiTripPlan aiTripPlan);
    Optional<AiTripPlan> findByTripId(Long tripId);
}