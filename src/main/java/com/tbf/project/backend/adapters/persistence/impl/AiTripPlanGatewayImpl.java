package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.AiTripPlanJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.AiTripPlanJpaRepository;
import com.tbf.project.backend.entities.gateway.AiTripPlanGateway;
import com.tbf.project.backend.entities.model.AiTripPlan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AiTripPlanGatewayImpl implements AiTripPlanGateway {

    private final AiTripPlanJpaRepository repository;

    @Override
    public AiTripPlan save(AiTripPlan aiTripPlan) {
        AiTripPlanJpaEntity entity = toEntity(aiTripPlan);
        AiTripPlanJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<AiTripPlan> findByTripId(Long tripId) {
        return repository.findByTripId(tripId).map(this::toDomain);
    }

    private AiTripPlanJpaEntity toEntity(AiTripPlan domain) {
        return AiTripPlanJpaEntity.builder()
                .id(domain.getId())
                .tripId(domain.getTripId())
                .generatedByUserId(domain.getGeneratedByUserId())
                .planJson(domain.getPlanJson())
                .generatedAt(domain.getGeneratedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    private AiTripPlan toDomain(AiTripPlanJpaEntity entity) {
        return AiTripPlan.builder()
                .id(entity.getId())
                .tripId(entity.getTripId())
                .generatedByUserId(entity.getGeneratedByUserId())
                .planJson(entity.getPlanJson())
                .generatedAt(entity.getGeneratedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}