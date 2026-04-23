package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.TripJoinRequestResponseDto;
import com.tbf.project.backend.application.mapper.TripMapper;
import com.tbf.project.backend.application.usecases.GetTripJoinRequestsUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripJoinRequestGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripJoinRequest;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;

import java.util.Comparator;
import java.util.List;

public class GetTripJoinRequestsUseCaseImpl implements GetTripJoinRequestsUseCase {

    private final TripGateway tripGateway;
    private final TripJoinRequestGateway tripJoinRequestGateway;
    private final ProfileGateway profileGateway;

    public GetTripJoinRequestsUseCaseImpl(
            TripGateway tripGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            ProfileGateway profileGateway
    ) {
        this.tripGateway = tripGateway;
        this.tripJoinRequestGateway = tripJoinRequestGateway;
        this.profileGateway = profileGateway;
    }

    @Override
    public List<TripJoinRequestResponseDto> execute(Long currentUserId, Long tripId) {
        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found for ID: " + tripId));

        if (!trip.isOwnedBy(currentUserId)) {
            throw new IllegalArgumentException("Only the trip owner can view join requests.");
        }

        List<TripJoinRequest> requests = tripJoinRequestGateway.findAllByTripIdAndStatus(
                tripId,
                TripJoinRequestStatus.PENDING
        );

        return requests.stream()
                .map(request -> {
                    UserProfile requester = profileGateway.findById(request.getRequesterUserId()).orElse(null);
                    return TripMapper.toTripJoinRequestDto(request, requester);
                })
                .sorted(Comparator.comparing(TripJoinRequestResponseDto::createdAt))
                .toList();
    }
}