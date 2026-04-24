package com.tbf.project.backend.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MatchResponseDto(
        Long matchId,
        Long otherUserId,
        String fullName,
        int age,
        String currentLocation,
        String originCountry,
        String profilePictureUrl,
        String bio,
        String socialBattery,
        String planningStyle,
        String budget,
        int reciprocalCompatibilityScore,
        boolean superLikeInvolved,
        LocalDateTime matchedAt,
        List<String> contextBadges,
        String whyYouMatched
) {
}