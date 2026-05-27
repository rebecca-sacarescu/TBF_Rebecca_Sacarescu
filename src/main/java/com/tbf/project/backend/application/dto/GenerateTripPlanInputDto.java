package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.Size;

public record GenerateTripPlanInputDto(
        @Size(max = 500, message = "Prompt must not exceed 500 characters")
        String userPrompt
) {}