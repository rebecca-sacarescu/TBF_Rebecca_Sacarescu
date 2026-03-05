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
        String gender,

        @NotBlank
        String originCountry,

        @NotBlank
        String originCity,

        String currentLocation,

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