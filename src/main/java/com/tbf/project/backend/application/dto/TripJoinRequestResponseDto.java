package com.tbf.project.backend.application.dto;

import java.time.LocalDateTime;

public record TripJoinRequestResponseDto(
        Long requestId,
        Long requesterUserId,
        String requesterFullName,
        String requesterProfilePictureUrl,
        String requesterCurrentLocation,
        String message,
        String status,
        LocalDateTime createdAt
) {
}