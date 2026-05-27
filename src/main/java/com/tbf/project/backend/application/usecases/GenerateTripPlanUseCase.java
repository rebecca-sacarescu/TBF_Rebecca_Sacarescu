package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;
import com.tbf.project.backend.application.dto.GenerateTripPlanInputDto;

public interface GenerateTripPlanUseCase {
    AiTripPlanResponseDto execute(Long currentUserId, Long tripId, GenerateTripPlanInputDto input);
}