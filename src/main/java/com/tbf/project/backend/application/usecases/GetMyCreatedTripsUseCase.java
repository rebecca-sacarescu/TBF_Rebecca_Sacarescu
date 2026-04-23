package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.TripCardResponseDto;

import java.util.List;

public interface GetMyCreatedTripsUseCase {
    List<TripCardResponseDto> execute(Long currentUserId);
}