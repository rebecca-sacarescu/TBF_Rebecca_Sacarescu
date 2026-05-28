package com.tbf.project.backend.adapters.persistence.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbf.project.backend.adapters.persistence.entities.TripCrewCompatibilityJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.TripCrewCompatibilityJpaRepository;
import com.tbf.project.backend.entities.gateway.TripCrewCompatibilityGateway;
import com.tbf.project.backend.entities.model.TripCrewCompatibility;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TripCrewCompatibilityGatewayImpl implements TripCrewCompatibilityGateway {

    private final TripCrewCompatibilityJpaRepository repository;
    private final ObjectMapper objectMapper;

    @Override
    public TripCrewCompatibility save(TripCrewCompatibility compatibility) {
        Optional<TripCrewCompatibilityJpaEntity> existing = repository
                .findByTripIdAndCandidateUserId(compatibility.getTripId(), compatibility.getCandidateUserId());

        TripCrewCompatibilityJpaEntity entity = existing.orElse(new TripCrewCompatibilityJpaEntity());
        entity.setTripId(compatibility.getTripId());
        entity.setCandidateUserId(compatibility.getCandidateUserId());
        entity.setOverallScore(compatibility.getOverallScore());
        entity.setBudgetScore(compatibility.getBudgetScore());
        entity.setSocialScore(compatibility.getSocialScore());
        entity.setPlanningScore(compatibility.getPlanningScore());
        entity.setInterestScore(compatibility.getInterestScore());
        entity.setDiversityScore(compatibility.getDiversityScore());
        entity.setHighlightsJson(serializeHighlights(compatibility.getHighlights()));
        entity.setCalculatedAt(compatibility.getCalculatedAt());

        TripCrewCompatibilityJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<TripCrewCompatibility> findByTripIdAndCandidateUserId(Long tripId, Long candidateUserId) {
        return repository.findByTripIdAndCandidateUserId(tripId, candidateUserId).map(this::toDomain);
    }

    @Override
    @Transactional
    public void deleteByTripId(Long tripId) {
        repository.deleteAllByTripId(tripId);
    }

    private TripCrewCompatibility toDomain(TripCrewCompatibilityJpaEntity entity) {
        return TripCrewCompatibility.builder()
                .id(entity.getId())
                .tripId(entity.getTripId())
                .candidateUserId(entity.getCandidateUserId())
                .overallScore(entity.getOverallScore())
                .budgetScore(entity.getBudgetScore())
                .socialScore(entity.getSocialScore())
                .planningScore(entity.getPlanningScore())
                .interestScore(entity.getInterestScore())
                .diversityScore(entity.getDiversityScore())
                .highlights(deserializeHighlights(entity.getHighlightsJson()))
                .calculatedAt(entity.getCalculatedAt())
                .build();
    }

    private String serializeHighlights(List<String> highlights) {
        try {
            return objectMapper.writeValueAsString(highlights);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> deserializeHighlights(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }
}