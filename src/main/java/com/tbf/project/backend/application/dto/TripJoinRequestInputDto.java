package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.Size;

public record TripJoinRequestInputDto(
        @Size(max = 500)
        String message
) {
}