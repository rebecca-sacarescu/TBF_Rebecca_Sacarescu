package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateTripInputDto(
        @NotBlank
        @Size(max = 120)
        String title,

        @NotBlank
        @Size(max = 100)
        String destinationCity,

        @NotBlank
        @Size(max = 100)
        String destinationCountry,

        @NotNull
        @FutureOrPresent
        LocalDate startDate,

        @NotNull
        LocalDate endDate,

        @NotBlank
        String budget,

        @NotBlank
        String tripType,

        @Size(max = 500)
        String description,

        @NotNull
        @Min(2)
        Integer targetGroupSize
) {
}