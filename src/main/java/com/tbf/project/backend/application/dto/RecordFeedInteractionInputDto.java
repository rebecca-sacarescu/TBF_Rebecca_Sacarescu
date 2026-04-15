package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecordFeedInteractionInputDto(
        @NotNull
        Long targetUserId,

        @NotBlank
        String interactionType
) {
}