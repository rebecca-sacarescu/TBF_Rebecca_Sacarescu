package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.TripCrewCompatibility;

import java.util.Optional;

public interface TripCrewCompatibilityGateway {
    TripCrewCompatibility save(TripCrewCompatibility compatibility);
    Optional<TripCrewCompatibility> findByTripIdAndCandidateUserId(Long tripId, Long candidateUserId);
    void deleteByTripId(Long tripId);
}