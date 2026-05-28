package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.CrewCompatibilityResponseDto;
import com.tbf.project.backend.application.service.CrewCompatibilityService;
import com.tbf.project.backend.application.usecases.ComputeAndSaveCrewCompatibilityUseCase;
import com.tbf.project.backend.entities.gateway.CrewCompatibilityCacheGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripCrewCompatibilityGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.TripCrewCompatibility;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.List;

public class ComputeAndSaveCrewCompatibilityUseCaseImpl implements ComputeAndSaveCrewCompatibilityUseCase {

    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final TripCrewCompatibilityGateway tripCrewCompatibilityGateway;
    private final CrewCompatibilityCacheGateway crewCompatibilityCacheGateway;
    private final CrewCompatibilityService crewCompatibilityService;

    public ComputeAndSaveCrewCompatibilityUseCaseImpl(
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway,
            TripCrewCompatibilityGateway tripCrewCompatibilityGateway,
            CrewCompatibilityCacheGateway crewCompatibilityCacheGateway,
            CrewCompatibilityService crewCompatibilityService
    ) {
        this.tripMemberGateway = tripMemberGateway;
        this.profileGateway = profileGateway;
        this.tripCrewCompatibilityGateway = tripCrewCompatibilityGateway;
        this.crewCompatibilityCacheGateway = crewCompatibilityCacheGateway;
        this.crewCompatibilityService = crewCompatibilityService;
    }

    @Override
    public CrewCompatibilityResponseDto execute(Long tripId, Long candidateUserId) {
        UserProfile candidate = profileGateway.findById(candidateUserId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));

        List<TripMember> members = tripMemberGateway.findAllActiveByTripId(tripId);
        List<Long> memberUserIds = members.stream().map(TripMember::getUserId).toList();
        List<UserProfile> crewProfiles = profileGateway.findAllByUserIds(memberUserIds);

        TripCrewCompatibility computed = crewCompatibilityService.compute(tripId, candidate, crewProfiles);
        TripCrewCompatibility saved = tripCrewCompatibilityGateway.save(computed);
        crewCompatibilityCacheGateway.put(tripId, candidateUserId, saved);

        return new CrewCompatibilityResponseDto(
                saved.getTripId(),
                saved.getCandidateUserId(),
                saved.getOverallScore(),
                saved.getBudgetScore(),
                saved.getSocialScore(),
                saved.getPlanningScore(),
                saved.getInterestScore(),
                saved.getDiversityScore(),
                saved.getHighlights(),
                saved.getCalculatedAt()
        );
    }
}