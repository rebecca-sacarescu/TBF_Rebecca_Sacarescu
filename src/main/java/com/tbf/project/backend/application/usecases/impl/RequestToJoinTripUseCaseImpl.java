package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.TripJoinRequestInputDto;
import com.tbf.project.backend.application.usecases.ComputeAndSaveCrewCompatibilityUseCase;
import com.tbf.project.backend.application.usecases.RequestToJoinTripUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripJoinRequestGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripJoinRequest;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;
import com.tbf.project.backend.entities.model.enums.TripStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RequestToJoinTripUseCaseImpl implements RequestToJoinTripUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final TripJoinRequestGateway tripJoinRequestGateway;
    private final ProfileGateway profileGateway;
    private final ComputeAndSaveCrewCompatibilityUseCase computeAndSaveCrewCompatibilityUseCase;

    public RequestToJoinTripUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            ProfileGateway profileGateway,
            ComputeAndSaveCrewCompatibilityUseCase computeAndSaveCrewCompatibilityUseCase
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.tripJoinRequestGateway = tripJoinRequestGateway;
        this.profileGateway = profileGateway;
        this.computeAndSaveCrewCompatibilityUseCase = computeAndSaveCrewCompatibilityUseCase;
    }

    @Override
    public void execute(Long currentUserId, Long tripId, TripJoinRequestInputDto input) {
        if (!profileGateway.existsByUserId(currentUserId)) {
            throw new IllegalArgumentException("Profile not found for user ID: " + currentUserId);
        }

        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found for ID: " + tripId));

        if (trip.isOwnedBy(currentUserId)) {
            throw new IllegalArgumentException("You cannot request to join your own trip.");
        }

        if (trip.getStatus() != TripStatus.OPEN) {
            throw new IllegalArgumentException("Trip is not open for join requests.");
        }

        if (trip.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Trip is no longer joinable.");
        }

        if (tripMemberGateway.existsActiveByTripIdAndUserId(tripId, currentUserId)) {
            throw new IllegalArgumentException("You are already a member of this trip.");
        }

        if (tripJoinRequestGateway.existsByTripIdAndRequesterUserIdAndStatus(
                tripId,
                currentUserId,
                TripJoinRequestStatus.PENDING
        )) {
            throw new IllegalArgumentException("You already have a pending join request for this trip.");
        }

        long currentMembers = tripMemberGateway.countActiveByTripId(tripId);
        if (currentMembers >= trip.getTargetGroupSize()) {
            throw new IllegalArgumentException("Trip is already full.");
        }

        tripJoinRequestGateway.save(TripJoinRequest.builder()
                .tripId(tripId)
                .requesterUserId(currentUserId)
                .message(input.message() == null ? null : input.message().trim())
                .status(TripJoinRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .resolvedAt(null)
                .build());

        computeAndSaveCrewCompatibilityUseCase.execute(tripId, currentUserId);
    }
}