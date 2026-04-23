package com.tbf.project.backend.application.mapper;

import com.tbf.project.backend.application.dto.TripCardResponseDto;
import com.tbf.project.backend.application.dto.TripJoinRequestResponseDto;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripJoinRequest;
import com.tbf.project.backend.entities.model.UserProfile;

public class TripMapper {

    private TripMapper() {
    }

    public static TripCardResponseDto toTripCardDto(
            Trip trip,
            UserProfile ownerProfile,
            int currentMemberCount
    ) {
        int spotsLeft = Math.max(0, trip.getTargetGroupSize() - currentMemberCount);

        return new TripCardResponseDto(
                trip.getId(),
                trip.getOwnerUserId(),
                ownerProfile != null ? ownerProfile.getFullName() : null,
                ownerProfile != null ? ownerProfile.getProfilePictureUrl() : null,
                trip.getTitle(),
                trip.getDestinationCity(),
                trip.getDestinationCountry(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudget().name(),
                trip.getTripType().name(),
                trip.getDescription(),
                trip.getTargetGroupSize(),
                currentMemberCount,
                spotsLeft,
                trip.getStatus().name()
        );
    }

    public static TripJoinRequestResponseDto toTripJoinRequestDto(
            TripJoinRequest request,
            UserProfile requesterProfile
    ) {
        return new TripJoinRequestResponseDto(
                request.getId(),
                request.getRequesterUserId(),
                requesterProfile != null ? requesterProfile.getFullName() : null,
                requesterProfile != null ? requesterProfile.getProfilePictureUrl() : null,
                requesterProfile != null ? requesterProfile.getCurrentLocation() : null,
                request.getMessage(),
                request.getStatus().name(),
                request.getCreatedAt()
        );
    }
}