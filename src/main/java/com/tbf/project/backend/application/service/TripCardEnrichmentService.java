package com.tbf.project.backend.application.service;

import com.tbf.project.backend.application.dto.TripCountdownDto;
import com.tbf.project.backend.application.dto.TripMemberPreviewDto;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.UserProfile;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TripCardEnrichmentService {

    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final TripCountdownService tripCountdownService;

    public TripCardEnrichmentService(
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway,
            TripCountdownService tripCountdownService
    ) {
        this.tripMemberGateway = tripMemberGateway;
        this.profileGateway = profileGateway;
        this.tripCountdownService = tripCountdownService;
    }

    public List<TripMemberPreviewDto> buildMemberPreview(Long tripId) {
        List<TripMember> members = tripMemberGateway.findAllActiveByTripId(tripId);

        List<Long> userIds = members.stream()
                .map(TripMember::getUserId)
                .toList();

        Map<Long, UserProfile> profileByUserId = profileGateway.findAllByUserIds(userIds)
                .stream()
                .collect(Collectors.toMap(UserProfile::getUserId, profile -> profile));

        return members.stream()
                .sorted(Comparator.comparing(TripMember::isOwner).reversed())
                .limit(3)
                .map(member -> {
                    UserProfile profile = profileByUserId.get(member.getUserId());

                    return new TripMemberPreviewDto(
                            member.getUserId(),
                            profile != null ? profile.getFullName() : null,
                            profile != null ? profile.getProfilePictureUrl() : null,
                            member.getRole().name()
                    );
                })
                .toList();
    }

    public TripCountdownDto buildCountdown(Trip trip) {
        return tripCountdownService.build(trip, LocalDate.now());
    }
}