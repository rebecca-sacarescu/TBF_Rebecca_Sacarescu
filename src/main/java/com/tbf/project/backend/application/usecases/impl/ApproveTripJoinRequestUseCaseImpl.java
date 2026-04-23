package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.usecases.ApproveTripJoinRequestUseCase;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripJoinRequestGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripJoinRequest;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;
import com.tbf.project.backend.entities.model.enums.TripMemberRole;
import com.tbf.project.backend.entities.model.enums.TripMemberStatus;
import com.tbf.project.backend.entities.model.enums.TripStatus;

import java.time.LocalDateTime;

public class ApproveTripJoinRequestUseCaseImpl implements ApproveTripJoinRequestUseCase {

    private final TripGateway tripGateway;
    private final TripJoinRequestGateway tripJoinRequestGateway;
    private final TripMemberGateway tripMemberGateway;

    public ApproveTripJoinRequestUseCaseImpl(
            TripGateway tripGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            TripMemberGateway tripMemberGateway
    ) {
        this.tripGateway = tripGateway;
        this.tripJoinRequestGateway = tripJoinRequestGateway;
        this.tripMemberGateway = tripMemberGateway;
    }

    @Override
    public void execute(Long currentUserId, Long tripId, Long requestId) {
        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found for ID: " + tripId));

        if (!trip.isOwnedBy(currentUserId)) {
            throw new IllegalArgumentException("Only the trip owner can approve join requests.");
        }

        TripJoinRequest request = tripJoinRequestGateway.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Join request not found for ID: " + requestId));

        if (!request.getTripId().equals(tripId)) {
            throw new IllegalArgumentException("Join request does not belong to the specified trip.");
        }

        if (request.getStatus() != TripJoinRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending join requests can be approved.");
        }

        if (trip.getStatus() != TripStatus.OPEN) {
            throw new IllegalArgumentException("Trip is not open anymore.");
        }

        if (tripMemberGateway.existsActiveByTripIdAndUserId(tripId, request.getRequesterUserId())) {
            throw new IllegalArgumentException("Requester is already a member of this trip.");
        }

        long currentMembers = tripMemberGateway.countActiveByTripId(tripId);
        if (currentMembers >= trip.getTargetGroupSize()) {
            trip.setStatus(TripStatus.FULL);
            trip.setUpdatedAt(LocalDateTime.now());
            tripGateway.save(trip);
            throw new IllegalArgumentException("Trip is already full.");
        }

        tripMemberGateway.save(TripMember.builder()
                .tripId(tripId)
                .userId(request.getRequesterUserId())
                .role(TripMemberRole.MEMBER)
                .status(TripMemberStatus.ACTIVE)
                .joinedAt(LocalDateTime.now())
                .build());

        request.setStatus(TripJoinRequestStatus.APPROVED);
        request.setResolvedAt(LocalDateTime.now());
        tripJoinRequestGateway.save(request);

        long updatedMembers = tripMemberGateway.countActiveByTripId(tripId);
        if (updatedMembers >= trip.getTargetGroupSize()) {
            trip.setStatus(TripStatus.FULL);
            trip.setUpdatedAt(LocalDateTime.now());
            tripGateway.save(trip);
        }
    }
}