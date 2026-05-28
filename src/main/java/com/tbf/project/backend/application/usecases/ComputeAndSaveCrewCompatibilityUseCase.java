package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.CrewCompatibilityResponseDto;

public interface ComputeAndSaveCrewCompatibilityUseCase {
    CrewCompatibilityResponseDto execute(Long tripId, Long candidateUserId);
}