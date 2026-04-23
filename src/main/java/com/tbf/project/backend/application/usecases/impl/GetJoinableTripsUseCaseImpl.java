package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.TripCardResponseDto;
import com.tbf.project.backend.application.mapper.TripMapper;
import com.tbf.project.backend.application.usecases.GetJoinableTripsUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripJoinRequestGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;
import com.tbf.project.backend.entities.model.enums.TripStatus;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public class GetJoinableTripsUseCaseImpl implements GetJoinableTripsUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final TripJoinRequestGateway tripJoinRequestGateway;
    private final ProfileGateway profileGateway;

    public GetJoinableTripsUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            ProfileGateway profileGateway
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.tripJoinRequestGateway = tripJoinRequestGateway;
        this.profileGateway = profileGateway;
    }

    @Override
    public List<TripCardResponseDto> execute(Long currentUserId) {
        List<Trip> candidates = tripGateway.findAllByStatusAndStartDateGreaterThanEqualAndOwnerUserIdNot(
                TripStatus.OPEN,
                LocalDate.now(),
                currentUserId
        );

        return candidates.stream()
                .filter(trip -> !tripMemberGateway.existsActiveByTripIdAndUserId(trip.getId(), currentUserId))
                .filter(trip -> !tripJoinRequestGateway.existsByTripIdAndRequesterUserIdAndStatus(
                        trip.getId(),
                        currentUserId,
                        TripJoinRequestStatus.PENDING
                ))
                .map(trip -> {
                    int currentMembers = (int) tripMemberGateway.countActiveByTripId(trip.getId());
                    if (currentMembers >= trip.getTargetGroupSize()) {
                        return null;
                    }

                    UserProfile ownerProfile = profileGateway.findById(trip.getOwnerUserId()).orElse(null);
                    return TripMapper.toTripCardDto(trip, ownerProfile, currentMembers);
                })
                .filter(dto -> dto != null)
                .sorted(Comparator.comparing(TripCardResponseDto::startDate))
                .toList();
    }
}