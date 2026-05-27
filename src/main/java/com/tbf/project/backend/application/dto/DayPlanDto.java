package com.tbf.project.backend.application.dto;

import java.util.List;

public record DayPlanDto(
        int dayNumber,
        String theme,
        List<ActivityDto> activities
) {}