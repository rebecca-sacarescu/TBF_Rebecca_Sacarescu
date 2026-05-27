package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;
import com.tbf.project.backend.application.mapper.AiTripPlanMapper;
import com.tbf.project.backend.application.usecases.GetTripPlanUseCase;
import com.tbf.project.backend.entities.gateway.AiTripPlanGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.AiTripPlan;
import com.tbf.project.backend.entities.model.UserProfile;

public class GetTripPlanUseCaseImpl implements GetTripPlanUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final AiTripPlanGateway aiTripPlanGateway;
    private final AiTripPlanMapper aiTripPlanMapper;

    public GetTripPlanUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway,
            AiTripPlanGateway aiTripPlanGateway,
            AiTripPlanMapper aiTripPlanMapper
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.profileGateway = profileGateway;
        this.aiTripPlanGateway = aiTripPlanGateway;
        this.aiTripPlanMapper = aiTripPlanMapper;
    }

    @Override
    public AiTripPlanResponseDto execute(Long currentUserId, Long tripId) {

        // 1. Validate trip exists
        tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // 2. Validate current user is ACTIVE member
        boolean isActiveMember = tripMemberGateway.existsActiveByTripIdAndUserId(tripId, currentUserId);
        if (!isActiveMember) {
            throw new SecurityException("You are not an active member of this trip");
        }

        // 3. Load plan
        AiTripPlan plan = aiTripPlanGateway.findByTripId(tripId)
                .orElseThrow(() -> new IllegalStateException("No AI plan generated for this trip yet"));

        // 4. Load generator name
        String generatedByName = profileGateway.findById(plan.getGeneratedByUserId())
                .map(UserProfile::getFullName)
                .orElse("A crew member");

        return aiTripPlanMapper.toDto(plan, generatedByName);
    }
}