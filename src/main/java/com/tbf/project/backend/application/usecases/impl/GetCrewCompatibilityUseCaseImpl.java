package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.CrewCompatibilityResponseDto;
import com.tbf.project.backend.application.service.CrewCompatibilityService;
import com.tbf.project.backend.application.usecases.GetCrewCompatibilityUseCase;
import com.tbf.project.backend.entities.gateway.CrewCompatibilityCacheGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripCrewCompatibilityGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.TripCrewCompatibility;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.List;
import java.util.Optional;

public class GetCrewCompatibilityUseCaseImpl implements GetCrewCompatibilityUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final TripCrewCompatibilityGateway tripCrewCompatibilityGateway;
    private final CrewCompatibilityCacheGateway crewCompatibilityCacheGateway;
    private final CrewCompatibilityService crewCompatibilityService;

    public GetCrewCompatibilityUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway,
            TripCrewCompatibilityGateway tripCrewCompatibilityGateway,
            CrewCompatibilityCacheGateway crewCompatibilityCacheGateway,
            CrewCompatibilityService crewCompatibilityService
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.profileGateway = profileGateway;
        this.tripCrewCompatibilityGateway = tripCrewCompatibilityGateway;
        this.crewCompatibilityCacheGateway = crewCompatibilityCacheGateway;
        this.crewCompatibilityService = crewCompatibilityService;
    }

    @Override
    public CrewCompatibilityResponseDto execute(Long currentUserId, Long tripId) {
        tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        Optional<TripCrewCompatibility> cached = crewCompatibilityCacheGateway.get(tripId, currentUserId);
        if (cached.isPresent()) {
            return toDto(cached.get());
        }

        Optional<TripCrewCompatibility> persisted = tripCrewCompatibilityGateway
                .findByTripIdAndCandidateUserId(tripId, currentUserId);
        if (persisted.isPresent()) {
            crewCompatibilityCacheGateway.put(tripId, currentUserId, persisted.get());
            return toDto(persisted.get());
        }

        UserProfile candidate = profileGateway.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));

        List<TripMember> members = tripMemberGateway.findAllActiveByTripId(tripId);
        List<Long> memberUserIds = members.stream().map(TripMember::getUserId).toList();
        List<UserProfile> crewProfiles = profileGateway.findAllByUserIds(memberUserIds);

        TripCrewCompatibility computed = crewCompatibilityService.compute(tripId, candidate, crewProfiles);
        TripCrewCompatibility saved = tripCrewCompatibilityGateway.save(computed);
        crewCompatibilityCacheGateway.put(tripId, currentUserId, saved);

        return toDto(saved);
    }

    private CrewCompatibilityResponseDto toDto(TripCrewCompatibility c) {
        return new CrewCompatibilityResponseDto(
                c.getTripId(),
                c.getCandidateUserId(),
                c.getOverallScore(),
                c.getBudgetScore(),
                c.getSocialScore(),
                c.getPlanningScore(),
                c.getInterestScore(),
                c.getDiversityScore(),
                c.getHighlights(),
                c.getCalculatedAt()
        );
    }
}