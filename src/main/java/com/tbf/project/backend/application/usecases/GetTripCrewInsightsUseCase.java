package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.TripCrewInsightsResponseDto;

public interface GetTripCrewInsightsUseCase {
    TripCrewInsightsResponseDto execute(Long currentUserId, Long tripId);
}