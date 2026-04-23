package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.CreateTripInputDto;
import com.tbf.project.backend.application.dto.TripCardResponseDto;

public interface CreateTripUseCase {
    TripCardResponseDto execute(Long currentUserId, CreateTripInputDto input);
}