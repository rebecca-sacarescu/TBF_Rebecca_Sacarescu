package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;

public interface GetTripPlanUseCase {
    AiTripPlanResponseDto execute(Long currentUserId, Long tripId);
}