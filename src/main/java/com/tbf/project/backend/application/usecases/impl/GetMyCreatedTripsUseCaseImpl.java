package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.TripCardResponseDto;
import com.tbf.project.backend.application.mapper.TripMapper;
import com.tbf.project.backend.application.service.TripCardEnrichmentService;
import com.tbf.project.backend.application.usecases.GetMyCreatedTripsUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.Comparator;
import java.util.List;

public class GetMyCreatedTripsUseCaseImpl implements GetMyCreatedTripsUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final TripCardEnrichmentService tripCardEnrichmentService;

    public GetMyCreatedTripsUseCaseImpl(
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
        UserProfile ownerProfile = profileGateway.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + currentUserId));

        List<Trip> trips = tripGateway.findAllByOwnerUserId(currentUserId);

        return trips.stream()
                .map(trip -> TripMapper.toTripCardDto(
                        trip,
                        ownerProfile,
                        (int) tripMemberGateway.countActiveByTripId(trip.getId()),
                        tripCardEnrichmentService.buildMemberPreview(trip.getId()),
                        tripCardEnrichmentService.buildCountdown(trip)
                ))
                .sorted(Comparator.comparing(TripCardResponseDto::startDate))
                .toList();
    }
}