package com.tbf.project.backend.application.dto;

import java.util.List;

public record TripCrewInsightsResponseDto(
        Long tripId,
        int groupSize,
        int targetGroupSize,
        int spotsLeft,
        String dominantBudget,
        String dominantPlanningStyle,
        String dominantSocialBattery,
        List<TripCrewTopAttributeDto> topLanguages,
        List<TripCrewTopAttributeDto> topActivities,
        String groupVibe,
        List<String> insights
) {
}