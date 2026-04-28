package com.tbf.project.backend.application.mapper;

import com.tbf.project.backend.application.dto.TripChatMessageResponseDto;
import com.tbf.project.backend.entities.model.TripChatMessage;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.Map;

public class TripChatMessageMapper {

    public TripChatMessageResponseDto toDto(
            TripChatMessage message,
            Map<Long, UserProfile> profilesByUserId
    ) {
        UserProfile senderProfile = profilesByUserId.get(message.getSenderUserId());

        return new TripChatMessageResponseDto(
                message.getId(),
                message.getTripId(),
                message.getSenderUserId(),
                senderProfile != null ? senderProfile.getFullName() : "Unknown traveler",
                senderProfile != null ? senderProfile.getProfilePictureUrl() : null,
                message.getContent(),
                message.getMessageType().name(),
                message.getCreatedAt()
        );
    }
}