package com.tbf.project.backend.application.dto;

import java.util.List;

public record FeedItemResponseDto(
        Long userId,
        String fullName,
        int age,
        String currentLocation,
        String profilePictureUrl,
        String bio,
        String socialBattery,
        String planningStyle,
        String budget,
        List<String> activities,
        List<String> languages,
        List<String> lookingForWhat,
        int reciprocalCompatibilityScore,
        List<String> compatibilityHighlights
) {
}