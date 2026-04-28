package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.CreateTripInputDto;
import com.tbf.project.backend.application.dto.TripCardResponseDto;
import com.tbf.project.backend.application.mapper.TripMapper;
import com.tbf.project.backend.application.usecases.CreateTripUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.Budget;
import com.tbf.project.backend.entities.model.enums.TripMemberRole;
import com.tbf.project.backend.entities.model.enums.TripMemberStatus;
import com.tbf.project.backend.entities.model.enums.TripStatus;
import com.tbf.project.backend.entities.model.enums.TripType;
import com.tbf.project.backend.application.service.TripCardEnrichmentService;

import java.time.LocalDateTime;

public class CreateTripUseCaseImpl implements CreateTripUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final TripCardEnrichmentService tripCardEnrichmentService;

    public CreateTripUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway,
            TripCardEnrichmentService tripCardEnrichmentService
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.profileGateway = profileGateway;
        this.tripCardEnrichmentService = tripCardEnrichmentService;
    }

    @Override
    public TripCardResponseDto execute(Long currentUserId, CreateTripInputDto input) {
        UserProfile ownerProfile = profileGateway.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + currentUserId));

        if (!input.startDate().isBefore(input.endDate())) {
            throw new IllegalArgumentException("Trip start date must be before end date.");
        }

        Budget budget = parseBudget(input.budget());
        TripType tripType = parseTripType(input.tripType());

        LocalDateTime now = LocalDateTime.now();

        Trip savedTrip = tripGateway.save(Trip.builder()
                .ownerUserId(currentUserId)
                .title(input.title().trim())
                .destinationCity(input.destinationCity().trim())
                .destinationCountry(input.destinationCountry().trim())
                .startDate(input.startDate())
                .endDate(input.endDate())
                .budget(budget)
                .tripType(tripType)
                .description(input.description() == null ? null : input.description().trim())
                .targetGroupSize(input.targetGroupSize())
                .status(TripStatus.OPEN)
                .createdAt(now)
                .updatedAt(now)
                .build());

        tripMemberGateway.save(TripMember.builder()
                .tripId(savedTrip.getId())
                .userId(currentUserId)
                .role(TripMemberRole.OWNER)
                .status(TripMemberStatus.ACTIVE)
                .joinedAt(now)
                .build());

        return TripMapper.toTripCardDto(
                savedTrip,
                ownerProfile,
                1,
                tripCardEnrichmentService.buildMemberPreview(savedTrip.getId()),
                tripCardEnrichmentService.buildCountdown(savedTrip)
        );
    }
    private Budget parseBudget(String rawValue) {
        try {
            return Budget.valueOf(rawValue.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid budget: " + rawValue);
        }
    }

    private TripType parseTripType(String rawValue) {
        try {
            return TripType.valueOf(rawValue.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid trip type: " + rawValue);
        }
    }
}