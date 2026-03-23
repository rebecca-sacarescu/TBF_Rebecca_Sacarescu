package com.tbf.project.backend.application.dto;

import java.time.LocalDate;
import java.util.List;

public record MyProfileResponseDto(
        String fullName,
        LocalDate birthDate,
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
        List<String> lookingForWhat
) {}