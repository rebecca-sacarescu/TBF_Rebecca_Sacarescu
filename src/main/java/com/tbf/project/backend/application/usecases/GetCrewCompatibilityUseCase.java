package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.CrewCompatibilityResponseDto;

public interface GetCrewCompatibilityUseCase {
    CrewCompatibilityResponseDto execute(Long currentUserId, Long tripId);
}