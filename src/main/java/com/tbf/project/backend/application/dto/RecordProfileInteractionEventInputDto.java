package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record RecordProfileInteractionEventInputDto(
        @NotBlank
        String eventType,

        @NotBlank
        String surface,

        @PositiveOrZero
        Long dwellTimeMs
) {
}