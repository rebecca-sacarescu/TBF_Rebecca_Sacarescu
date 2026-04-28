package com.tbf.project.backend.application.dto;

import java.time.LocalDateTime;

public record TripChatMessageResponseDto(
        Long id,
        Long tripId,
        Long senderUserId,
        String senderName,
        String senderProfilePictureUrl,
        String content,
        String messageType,
        LocalDateTime createdAt
) {
}