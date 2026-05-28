package com.tbf.project.backend.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CrewCompatibilityResponseDto(
        Long tripId,
        Long candidateUserId,
        int overallScore,
        int budgetScore,
        int socialScore,
        int planningScore,
        int interestScore,
        int diversityScore,
        List<String> highlights,
        LocalDateTime calculatedAt
) {}