package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateProfileInputDto(
        @NotBlank
        @Size(min = 2, max = 100)
        String fullName,

        @NotNull
        @Past
        LocalDate birthDate,

        @NotBlank
        @Size(max = 50)
        String gender,

        @NotBlank
        @Size(max = 100)
        String originCountry,

        @NotBlank
        @Size(max = 100)
        String originCity,

        @Size(max = 150)
        String currentLocation,

        @Size(max = 2048)
        String profilePictureUrl,

        @Size(max = 1000)
        String bio,

        @NotBlank
        String socialBattery,

        @NotBlank
        String planningStyle,

        @NotBlank
        String budget,

        List<String> activities,
        List<String> destinationTypes,
        List<String> experienceTypes,
        List<String> languages,
        List<String> lookingForWho,
        List<String> lookingForWhat
) {}