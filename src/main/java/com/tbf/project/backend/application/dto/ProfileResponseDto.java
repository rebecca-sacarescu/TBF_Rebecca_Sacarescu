package com.tbf.project.backend.application.dto;

import java.util.List;

public record ProfileResponseDto(
        String fullName,
        int age,
        String gender,
        String location,
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
        List<String> lookingForWhat
) {}