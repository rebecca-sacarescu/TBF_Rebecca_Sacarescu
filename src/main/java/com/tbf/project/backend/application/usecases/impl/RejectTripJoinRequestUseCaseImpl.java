package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.usecases.RejectTripJoinRequestUseCase;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripJoinRequestGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripJoinRequest;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;

import java.time.LocalDateTime;

public class RejectTripJoinRequestUseCaseImpl implements RejectTripJoinRequestUseCase {

    private final TripGateway tripGateway;
    private final TripJoinRequestGateway tripJoinRequestGateway;

    public RejectTripJoinRequestUseCaseImpl(
            TripGateway tripGateway,
            TripJoinRequestGateway tripJoinRequestGateway
    ) {
        this.tripGateway = tripGateway;
        this.tripJoinRequestGateway = tripJoinRequestGateway;
    }

    @Override
    public void execute(Long currentUserId, Long tripId, Long requestId) {
        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found for ID: " + tripId));

        if (!trip.isOwnedBy(currentUserId)) {
            throw new IllegalArgumentException("Only the trip owner can reject join requests.");
        }

        TripJoinRequest request = tripJoinRequestGateway.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Join request not found for ID: " + requestId));

        if (!request.getTripId().equals(tripId)) {
            throw new IllegalArgumentException("Join request does not belong to the specified trip.");
        }

        if (request.getStatus() != TripJoinRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending join requests can be rejected.");
        }

        request.setStatus(TripJoinRequestStatus.REJECTED);
        request.setResolvedAt(LocalDateTime.now());
        tripJoinRequestGateway.save(request);
    }
}