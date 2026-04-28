package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.TripChatMessageResponseDto;
import com.tbf.project.backend.application.mapper.TripChatMessageMapper;
import com.tbf.project.backend.application.usecases.GetTripChatMessagesUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripChatMessageGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.TripChatMessage;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class GetTripChatMessagesUseCaseImpl implements GetTripChatMessagesUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final TripChatMessageGateway tripChatMessageGateway;
    private final ProfileGateway profileGateway;
    private final TripChatMessageMapper mapper;

    public GetTripChatMessagesUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            TripChatMessageGateway tripChatMessageGateway,
            ProfileGateway profileGateway,
            TripChatMessageMapper mapper
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.tripChatMessageGateway = tripChatMessageGateway;
        this.profileGateway = profileGateway;
        this.mapper = mapper;
    }

    @Override
    public List<TripChatMessageResponseDto> execute(
            Long currentUserId,
            Long tripId,
            int page,
            int size
    ) {
        tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found for ID: " + tripId));

        if (!tripMemberGateway.existsActiveByTripIdAndUserId(tripId, currentUserId)) {
            throw new SecurityException("You are not an active member of this trip.");
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        List<TripChatMessage> messages =
                tripChatMessageGateway.findByTripIdOrderByCreatedAtAscIdAsc(
                        tripId,
                        safePage,
                        safeSize
                );

        List<Long> senderIds = messages.stream()
                .map(TripChatMessage::getSenderUserId)
                .distinct()
                .toList();

        Map<Long, UserProfile> profilesByUserId = profileGateway.findAllByUserIds(senderIds)
                .stream()
                .collect(Collectors.toMap(
                        UserProfile::getUserId,
                        Function.identity()
                ));

        return messages.stream()
                .map(message -> mapper.toDto(message, profilesByUserId))
                .toList();
    }
}