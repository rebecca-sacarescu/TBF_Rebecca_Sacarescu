package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.TripCrewCompatibility;

import java.util.Optional;

public interface CrewCompatibilityCacheGateway {
    void put(Long tripId, Long candidateUserId, TripCrewCompatibility compatibility);
    Optional<TripCrewCompatibility> get(Long tripId, Long candidateUserId);
    void evictByTripId(Long tripId);
}