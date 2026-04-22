package com.tbf.project.backend.application.dto;

import java.time.LocalDateTime;

public record SavedProfileResponseDto(
        Long targetUserId,
        String fullName,
        int age,
        String currentLocation,
        String originCountry,
        String profilePictureUrl,
        String bio,
        String socialBattery,
        String planningStyle,
        String budget,
        int compatibilityScore,
        LocalDateTime savedAt
) {
}