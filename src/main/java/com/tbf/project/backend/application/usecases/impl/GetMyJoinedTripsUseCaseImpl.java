package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.TripCardResponseDto;
import com.tbf.project.backend.application.mapper.TripMapper;
import com.tbf.project.backend.application.service.TripCardEnrichmentService;
import com.tbf.project.backend.application.usecases.GetMyJoinedTripsUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.TripMemberRole;

import java.util.Comparator;
import java.util.List;

public class GetMyJoinedTripsUseCaseImpl implements GetMyJoinedTripsUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final TripCardEnrichmentService tripCardEnrichmentService;

    public GetMyJoinedTripsUseCaseImpl(
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
    public List<TripCardResponseDto> execute(Long currentUserId) {
        List<TripMember> memberships = tripMemberGateway.findAllActiveByUserIdAndRole(
                currentUserId,
                TripMemberRole.MEMBER
        );

        List<Long> tripIds = memberships.stream()
                .map(TripMember::getTripId)
                .toList();

        List<Trip> trips = tripGateway.findAllByIds(tripIds);

        return trips.stream()
                .map(trip -> {
                    UserProfile ownerProfile = profileGateway.findById(trip.getOwnerUserId()).orElse(null);
                    int currentMembers = (int) tripMemberGateway.countActiveByTripId(trip.getId());

                    return TripMapper.toTripCardDto(
                            trip,
                            ownerProfile,
                            currentMembers,
                            tripCardEnrichmentService.buildMemberPreview(trip.getId()),
                            tripCardEnrichmentService.buildCountdown(trip)
                    );
                })
                .sorted(Comparator.comparing(TripCardResponseDto::startDate))
                .toList();
    }
}