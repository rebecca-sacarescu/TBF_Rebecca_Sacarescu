package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.SendTripChatMessageInputDto;
import com.tbf.project.backend.application.dto.TripChatMessageResponseDto;
import com.tbf.project.backend.application.mapper.TripChatMessageMapper;
import com.tbf.project.backend.application.usecases.SendTripChatMessageUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripChatMessageGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripChatMessage;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.TripChatMessageType;
import com.tbf.project.backend.entities.model.enums.TripStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public class SendTripChatMessageUseCaseImpl implements SendTripChatMessageUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final TripChatMessageGateway tripChatMessageGateway;
    private final ProfileGateway profileGateway;
    private final TripChatMessageMapper mapper;

    public SendTripChatMessageUseCaseImpl(
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
    public TripChatMessageResponseDto execute(
            Long currentUserId,
            Long tripId,
            SendTripChatMessageInputDto input
    ) {
        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found for ID: " + tripId));

        if (!tripMemberGateway.existsActiveByTripIdAndUserId(tripId, currentUserId)) {
            throw new SecurityException("You are not an active member of this trip.");
        }

        if (!canSendMessages(trip)) {
            throw new IllegalArgumentException("Chat is read-only for this trip.");
        }

        String content = input.content() == null ? "" : input.content().trim();

        if (content.isBlank()) {
            throw new IllegalArgumentException("Message content cannot be blank.");
        }

        if (content.length() > 1000) {
            throw new IllegalArgumentException("Message content cannot exceed 1000 characters.");
        }

        TripChatMessage saved = tripChatMessageGateway.save(
                TripChatMessage.builder()
                        .tripId(tripId)
                        .senderUserId(currentUserId)
                        .content(content)
                        .messageType(TripChatMessageType.USER_MESSAGE)
                        .createdAt(LocalDateTime.now())
                        .editedAt(null)
                        .deletedAt(null)
                        .build()
        );

        UserProfile senderProfile = profileGateway.findById(currentUserId)
                .orElse(null);

        return mapper.toDto(saved, Map.of(currentUserId, senderProfile));
    }

    private boolean canSendMessages(Trip trip) {
        boolean validStatus = trip.getStatus() == TripStatus.OPEN || trip.getStatus() == TripStatus.FULL;
        boolean notEnded = !trip.getEndDate().isBefore(LocalDate.now());

        return validStatus && notEnded;
    }
}