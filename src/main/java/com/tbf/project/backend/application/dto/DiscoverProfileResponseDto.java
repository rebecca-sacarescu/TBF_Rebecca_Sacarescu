package com.tbf.project.backend.application.dto;

import java.util.List;

public record DiscoverProfileResponseDto(
        Long userId,
        String fullName,
        int age,
        String gender,
        String originCountry,
        String originCity,
        String currentLocation,
        String bio,
        String profilePictureUrl,
        String verificationStatus,
        String socialBattery,
        String planningStyle,
        String budget,
        List<String> activities,
        List<String> destinationTypes,
        List<String> experienceTypes,
        List<String> languages,
        List<String> lookingForWho,
        List<String> lookingForWhat,
        int reciprocalCompatibilityScore,
        List<String> compatibilityHighlights,
        boolean saved
) {
}