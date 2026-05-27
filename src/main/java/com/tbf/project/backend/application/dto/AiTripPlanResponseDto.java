package com.tbf.project.backend.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AiTripPlanResponseDto(
        Long tripId,
        Long generatedByUserId,
        String generatedByName,
        LocalDateTime generatedAt,
        String title,
        String summary,
        String estimatedBudgetPerPerson,
        List<DayPlanDto> days,
        List<String> generalTips,
        List<String> neighborhoods
) {}